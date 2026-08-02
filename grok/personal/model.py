#!/usr/bin/env python3
"""
Personal Model — on-device only.

Holds Viewer-specific identity, medical, financial, social data.
Exists solely so the Scrubber can prevent personal information from leaving the device.
Never transmitted. Destroy = Restart wipes it.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Default location under Termux-friendly $HOME
DEFAULT_MODEL_DIR = Path(os.path.expanduser("~/trv-vault/personal"))
DEFAULT_MODEL_FILE = DEFAULT_MODEL_DIR / "viewer_model.json"


def _empty_model(viewer_id: str = "local") -> dict[str, Any]:
    return {
        "viewer_id": viewer_id,
        "version": 1,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "identity": {
            "legal_name": None,
            "preferred_name": None,
            "dob": None,
            "addresses": [],
            "phone_numbers": [],
            "emails": [],
            "government_ids": [],
        },
        "medical": {
            "conditions": [],
            "medications": [],
            "allergies": [],
            "providers": [],
            "notes": [],
        },
        "financial": {
            "accounts": [],
            "income_sources": [],
            "debts": [],
            "key_numbers": [],
        },
        "social": {
            "relationships": [],
            "frequent_contacts": [],
            "patterns": [],
        },
        "preferences": {
            "communication_style": "direct",
            "privacy_level": "maximum",
            "scrub_aggressiveness": "high",
        },
        "derived": {
            "risk_patterns": [],
            "known_quasi_identifiers": [],
        },
    }


def load_model(path: Path | None = None) -> dict[str, Any]:
    """Load the Personal Model. Returns empty model if file does not exist."""
    model_path = path or DEFAULT_MODEL_FILE
    if not model_path.exists():
        return _empty_model()
    with open(model_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_model(model: dict[str, Any], path: Path | None = None) -> None:
    """Save the Personal Model (plaintext for now — wrap with age later)."""
    model_path = path or DEFAULT_MODEL_FILE
    model_path.parent.mkdir(parents=True, exist_ok=True)
    model["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(model_path, "w", encoding="utf-8") as f:
        json.dump(model, f, indent=2, ensure_ascii=False)


def update_field(section: str, key: str, value: Any, path: Path | None = None) -> dict[str, Any]:
    """Simple helper to update one field and persist."""
    model = load_model(path)
    if section not in model:
        raise KeyError(f"Unknown section: {section}")
    model[section][key] = value
    save_model(model, path)
    return model


if __name__ == "__main__":
    # Quick self-test
    m = load_model()
    print("Loaded model version:", m.get("version"))
    print("Viewer ID:", m.get("viewer_id"))
    print("Model path:", DEFAULT_MODEL_FILE)
