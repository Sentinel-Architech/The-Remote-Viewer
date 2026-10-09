#!/usr/bin/env python3
"""Sign one viewer license with an external master seed.

The seed file must be outside the repository. This script writes only the
public license payload and signature.
"""

from __future__ import annotations

import argparse
import os
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def refuse_inside_repo(path: Path) -> None:
    try:
        path.resolve().relative_to(ROOT.resolve())
    except ValueError:
        return
    sys.exit("Refusing to read a master key from inside the repository.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tier", type=int, default=0)
    parser.add_argument("--expires", type=int, default=0)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    key_path = Path(os.environ.get("TRV_MASTER_KEY_FILE", ""))
    if not key_path:
        sys.exit("Set TRV_MASTER_KEY_FILE to a seed file outside the repository.")
    refuse_inside_repo(key_path)
    seed = key_path.read_bytes()
    if len(seed) != 32:
        sys.exit("Master seed must be exactly 32 bytes.")
    try:
        from nacl.signing import SigningKey
    except ImportError:
        sys.exit("Install PyNaCl locally to sign. The seed was not copied.")
    member = uuid.uuid4().bytes
    payload = member + args.tier.to_bytes(4, "little") + args.expires.to_bytes(8, "little")
    signature = SigningKey(seed).sign(payload).signature
    args.out.write_bytes(payload + signature)
    public = SigningKey(seed).verify_key.encode().hex()
    print(f"viewer={member.hex()} public={public}")
    print("Compare public with the embedded verifier. Do not commit the seed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
