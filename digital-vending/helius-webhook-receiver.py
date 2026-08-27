#!/usr/bin/env python3
"""
Helius webhook receiver for TRV Path B sales.

- Listens on 127.0.0.1 (put Caddy/nginx or an SSH tunnel in front for HTTPS).
- No age secrets. No wallet keys. Ciphertext deliver only via existing bash tools.
- Auth: REQUIRED shared secret (X-TRV-Webhook-Secret or Authorization).

Env:
  SALES_ADDRESS          required (Solana base58)
  TRV_WEBHOOK_SECRET     required shared secret (>= 16 chars)
  TRV_ROOT               repo root (default: parent of this file's parent)
  DELIVER_DIR            default $HOME/trv-deliver
  HELIUS_BIND            default 127.0.0.1
  HELIUS_PORT            default 8787

Helius dashboard: webhook type Enhanced, accountAddresses = [SALES_ADDRESS],
transactionTypes = [Any] or TOKEN / TRANSFER as available.
"""

from __future__ import annotations

import hmac
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
# Solana signatures are base58; never pass arbitrary strings to the shell.
SIG_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{64,128}$")
SKU_RE = re.compile(r"^[a-z0-9-]{3,48}$")
USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

FALLBACK_SKU = {
    "TRV-POSTURE-LITE": "trv-posture-lite",
    "TRV-POSTURE-PACK": "trv-posture-pack",
    "SENTINEL-ZK-01": "sentinel-skill-zk-01",
    "TEST-HELLO": "hello-sentinel-demo",
}


def log(msg: str) -> None:
    print(f"[helius] {msg}", flush=True)


def load_sku_map() -> dict[str, str]:
    mapping = dict(FALLBACK_SKU)
    catalog_path = VENDING / "catalog.json"
    try:
        items = json.loads(catalog_path.read_text(encoding="utf-8"))
        if isinstance(items, list):
            for item in items:
                if not isinstance(item, dict):
                    continue
                memo = str(item.get("memo") or "").strip()
                sku = str(item.get("id") or "").strip()
                if memo and sku and SKU_RE.match(sku):
                    mapping[memo.upper()] = sku
    except OSError:
        pass
    return mapping


def memo_to_sku(memo: str) -> str:
    m = MEMO_RE.search(memo or "")
    if not m:
        return ""
    return load_sku_map().get(m.group(1).upper(), "")


def extract_memo(obj: dict) -> str:
    """Return only an allowlisted catalog memo token, never raw payload text."""
    blob_parts = []
    for key in ("memo", "Memo", "description"):
        v = obj.get(key)
        if isinstance(v, str) and v.strip():
            blob_parts.append(v)
    for k in ("instructions", "innerInstructions", "events"):
        if k in obj:
            blob_parts.append(json.dumps(obj.get(k)))
    meta = obj.get("meta") or {}
    if isinstance(meta, dict):
        for x in meta.get("logMessages") or []:
            blob_parts.append(str(x))
    blob_parts.append(json.dumps(obj))
    m = MEMO_RE.search(" ".join(blob_parts))
    return m.group(1) if m else ""


def extract_sig(obj: dict) -> str:
    for key in ("signature", "txHash", "hash"):
        v = obj.get(key)
        if isinstance(v, str) and SIG_RE.match(v):
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
        if mint and mint != USDC_MINT:
            continue
        raw = t.get("tokenAmount") or t.get("amount") or ""
        if raw is None:
            continue
        s = str(raw)
        if s:
            return s.split(".")[0] if "." in s else s
    return ""


def involves_sales_address(obj: dict) -> bool:
    """True only if SALES_ADDRESS is a destination account, not a JSON substring."""
    if not SALES_ADDRESS:
        return False
    fields: list[object] = []
    for t in obj.get("tokenTransfers") or []:
        if isinstance(t, dict):
            fields.extend([t.get("toUserAccount"), t.get("toTokenAccount"), t.get("to")])
    for t in obj.get("nativeTransfers") or []:
        if isinstance(t, dict):
            fields.append(t.get("toUserAccount"))
    for a in obj.get("accountData") or []:
        if isinstance(a, dict):
            fields.append(a.get("account"))
    return any(f == SALES_ADDRESS for f in fields if isinstance(f, str) and f)


def secret_match(got: str, expected: str) -> bool:
    if not got or not expected:
        return False
    a = got.encode("utf-8")
    b = expected.encode("utf-8")
    if len(a) != len(b):
        hmac.compare_digest(b, b)
        return False
    return hmac.compare_digest(a, b)


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

    sku = memo_to_sku(memo)
    if not sku or not SKU_RE.match(sku):
        return {"ok": False, "error": "unknown memo", "sig": sig}
    if not SIG_RE.match(sig):
        return {"ok": False, "error": "bad signature"}

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
            return False
        candidates = [
            self.headers.get("X-TRV-Webhook-Secret", ""),
            self.headers.get("Authorization", ""),
        ]
        auth = self.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            candidates.append(auth[7:].strip())
        matched = False
        for got in candidates:
            if secret_match(got, WEBHOOK_SECRET):
                matched = True
        return matched

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
            self._send(
                200,
                {
                    "ok": True,
                    "service": "trv-helius-webhook",
                    "sales": (SALES_ADDRESS[:8] + "…") if SALES_ADDRESS else None,
                    "auth": "required",
                },
            )
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
    if not WEBHOOK_SECRET:
        log("ERROR: set TRV_WEBHOOK_SECRET (required; refuse to start open)")
        return 1
    if len(WEBHOOK_SECRET) < 16:
        log("ERROR: TRV_WEBHOOK_SECRET must be at least 16 characters")
        return 1
    if BIND not in ("127.0.0.1", "::1", "localhost"):
        log(f"ERROR: HELIUS_BIND={BIND} refused — bind loopback only, put TLS in front")
        return 1
    DELIVER_DIR.mkdir(parents=True, exist_ok=True)
    log(f"bind {BIND}:{PORT}")
    log(f"sales {SALES_ADDRESS}")
    log(f"deliver {DELIVER_DIR}")
    log("secret set (required)")
    httpd = ThreadingHTTPServer((BIND, PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        log("stop")
    return 0


if __name__ == "__main__":
    sys.exit(main())
