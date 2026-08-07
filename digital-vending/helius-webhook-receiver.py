#!/usr/bin/env python3
"""
Helius webhook receiver for TRV Path B sales.

- Listens on 127.0.0.1 (put Caddy/nginx or an SSH tunnel in front for HTTPS).
- No age secrets. No wallet keys. Ciphertext deliver only via existing bash tools.
- Auth: optional shared secret header X-TRV-Webhook-Secret

Env:
  SALES_ADDRESS          required (Solana base58)
  TRV_WEBHOOK_SECRET     optional shared secret
  TRV_ROOT               repo root (default: parent of this file's parent)
  DELIVER_DIR            default $HOME/trv-deliver
  HELIUS_BIND            default 127.0.0.1
  HELIUS_PORT            default 8787

Helius dashboard: webhook type Enhanced, accountAddresses = [SALES_ADDRESS],
transactionTypes = [Any] or TOKEN / TRANSFER as available.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

SALES_ADDRESS = os.environ.get("SALES_ADDRESS", "").strip()
WEBHOOK_SECRET = os.environ.get("TRV_WEBHOOK_SECRET", "").strip()
BIND = os.environ.get("HELIUS_BIND", "127.0.0.1")
PORT = int(os.environ.get("HELIUS_PORT", "8787"))
DELIVER_DIR = Path(os.environ.get("DELIVER_DIR", Path.home() / "trv-deliver"))
SCRIPT_DIR = Path(__file__).resolve().parent
TRV_ROOT = Path(os.environ.get("TRV_ROOT", SCRIPT_DIR.parent))
VENDING = SCRIPT_DIR

MEMO_RE = re.compile(
    r"(TRV-Posture-Lite|TRV-Posture-Pack|SENTINEL-ZK-01|TEST-HELLO)",
    re.I,
)


def log(msg: str) -> None:
    print(f"[helius] {msg}", flush=True)


def extract_memo(obj: dict) -> str:
    """Best-effort memo from enhanced or raw-ish Helius payloads."""
    # Direct fields some payloads use
    for key in ("memo", "Memo"):
        v = obj.get(key)
        if isinstance(v, str) and v.strip():
            return v.strip()

    desc = obj.get("description") or ""
    if isinstance(desc, str):
        m = MEMO_RE.search(desc)
        if m:
            return m.group(1)

    # instructions / innerInstructions blobs
    blobs = []
    for k in ("instructions", "innerInstructions", "events"):
        if k in obj:
            blobs.append(json.dumps(obj.get(k)))
    # raw log messages if present
    meta = obj.get("meta") or {}
    if isinstance(meta, dict):
        logs = meta.get("logMessages") or []
        blobs.extend(str(x) for x in logs)

    text = " ".join(blobs) + " " + json.dumps(obj)
    m = MEMO_RE.search(text)
    if m:
        return m.group(1)

    # Helius sometimes puts memo program data as readable string in events
    events = obj.get("events") or {}
    if isinstance(events, dict):
        m = MEMO_RE.search(json.dumps(events))
        if m:
            return m.group(1)

    return ""


def extract_sig(obj: dict) -> str:
    for key in ("signature", "txHash", "hash"):
        v = obj.get(key)
        if isinstance(v, str) and len(v) > 40:
            return v
    return ""


def extract_amount_hint(obj: dict) -> str:
    """USDC amount string if present in tokenTransfers."""
    transfers = obj.get("tokenTransfers") or []
    if not isinstance(transfers, list):
        return ""
    for t in transfers:
        if not isinstance(t, dict):
            continue
        mint = (t.get("mint") or "").strip()
        # USDC mainnet
        if mint and mint != "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v":
            continue
        to_acct = (t.get("toUserAccount") or t.get("toTokenAccount") or "").strip()
        # If sales address appears as owner destination, prefer it
        raw = t.get("tokenAmount") or t.get("amount") or ""
        if raw is None:
            continue
        s = str(raw)
        # normalized float-ish
        if s:
            return s.split(".")[0] if "." in s else s
    return ""


def involves_sales_address(obj: dict) -> bool:
    if not SALES_ADDRESS:
        return True
    blob = json.dumps(obj)
    return SALES_ADDRESS in blob


def process_tx(obj: dict) -> dict:
    if not involves_sales_address(obj):
        return {"skipped": True, "reason": "not sales address"}

    sig = extract_sig(obj)
    memo = extract_memo(obj)
    amount = extract_amount_hint(obj)

    if not sig:
        return {"ok": False, "error": "no signature"}
    if not memo:
        return {"ok": False, "error": "no catalog memo", "sig": sig}

    # Map memo → SKU via existing script
    try:
        sku = subprocess.check_output(
            ["bash", str(VENDING / "memo-to-sku.sh"), memo],
            text=True,
            stderr=subprocess.STDOUT,
        ).strip()
    except subprocess.CalledProcessError as e:
        return {"ok": False, "error": "memo-to-sku failed", "detail": e.output, "sig": sig}

    # auto-deliver: pending if no age1 drop yet (exit 2 is OK)
    cmd = ["bash", str(VENDING / "auto-deliver.sh"), sku, sig]
    env = os.environ.copy()
    env["DELIVER_DIR"] = str(DELIVER_DIR)
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env=env,
            timeout=120,
        )
        return {
            "ok": proc.returncode in (0, 2),
            "rc": proc.returncode,
            "sku": sku,
            "sig": sig,
            "memo": memo,
            "amount_hint": amount,
            "stdout_tail": (proc.stdout or "")[-500:],
            "stderr_tail": (proc.stderr or "")[-500:],
        }
    except Exception as e:
        return {"ok": False, "error": str(e), "sig": sig, "sku": sku}


class Handler(BaseHTTPRequestHandler):
    server_version = "TRVHelius/1.0"

    def log_message(self, fmt: str, *args) -> None:
        log("%s - %s" % (self.address_string(), fmt % args))

    def _auth_ok(self) -> bool:
        if not WEBHOOK_SECRET:
            return True
        got = self.headers.get("X-TRV-Webhook-Secret", "")
        # Helius also allows authorization headers you set in dashboard
        if got == WEBHOOK_SECRET:
            return True
        auth = self.headers.get("Authorization", "")
        if auth == WEBHOOK_SECRET or auth == f"Bearer {WEBHOOK_SECRET}":
            return True
        return False

    def _send(self, code: int, body: dict) -> None:
        data = json.dumps(body).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path in ("/", "/health"):
            self._send(200, {"ok": True, "service": "trv-helius-webhook", "sales": SALES_ADDRESS[:8] + "…" if SALES_ADDRESS else None})
            return
        self._send(404, {"ok": False, "error": "not found"})

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path not in ("/", "/helius", "/webhook"):
            self._send(404, {"ok": False, "error": "not found"})
            return
        if not self._auth_ok():
            self._send(401, {"ok": False, "error": "unauthorized"})
            return

        length = int(self.headers.get("Content-Length", "0") or 0)
        if length > 5_000_000:
            self._send(413, {"ok": False, "error": "payload too large"})
            return
        raw = self.rfile.read(length) if length else b"[]"
        try:
            payload = json.loads(raw.decode("utf-8") or "[]")
        except json.JSONDecodeError:
            self._send(400, {"ok": False, "error": "invalid json"})
            return

        # Helius sends a list of txs for enhanced webhooks
        items = payload if isinstance(payload, list) else [payload]
        results = []
        for obj in items:
            if not isinstance(obj, dict):
                continue
            results.append(process_tx(obj))

        log(f"processed {len(results)} item(s)")
        self._send(200, {"ok": True, "results": results})


def main() -> int:
    if not SALES_ADDRESS:
        log("ERROR: set SALES_ADDRESS")
        return 1
    DELIVER_DIR.mkdir(parents=True, exist_ok=True)
    log(f"bind {BIND}:{PORT}")
    log(f"sales {SALES_ADDRESS}")
    log(f"deliver {DELIVER_DIR}")
    log(f"secret {'set' if WEBHOOK_SECRET else 'NOT set (open receiver)'}")
    httpd = ThreadingHTTPServer((BIND, PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        log("stop")
    return 0


if __name__ == "__main__":
    sys.exit(main())
