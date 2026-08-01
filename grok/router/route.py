#!/usr/bin/env python3
"""
Sentinel hybrid router — keyword rules first, classifier-ready.
Runs fully offline. Compatible with Termux / local llama.cpp setups.

Usage:
  python route.py "how do I control severe bleeding"
  python route.py --list
  python route.py --prompt "explain entanglement"   # emits classifier prompt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RULES_PATH = ROOT / "rules.toml"
INDEX_PATH = ROOT / "skill_index.json"
SKILLS_DIR = ROOT.parent / "skills"


def load_rules() -> list[tuple[str, list[str], str]]:
    """Minimal TOML-ish parser for our rules file. Returns ordered (group, patterns, skill)."""
    text = RULES_PATH.read_text(encoding="utf-8")
    groups: list[tuple[str, list[str], str]] = []
    current_group = None
    patterns: list[str] = []
    skill = None

    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[") and line.endswith("]"):
            if current_group and skill is not None:
                groups.append((current_group, patterns, skill))
            current_group = line.strip("[]")
            patterns = []
            skill = None
            continue
        if line.startswith("patterns"):
            # patterns = ["a", "b", ...]
            inside = line.split("=", 1)[1].strip()
            inside = inside.strip("[]")
            patterns = [p.strip().strip('"').strip("'") for p in inside.split(",") if p.strip()]
            continue
        if line.startswith("skill"):
            skill = line.split("=", 1)[1].strip().strip('"').strip("'")
            continue

    if current_group and skill is not None:
        groups.append((current_group, patterns, skill))

    # priority.* groups first, then fallback
    priority = [g for g in groups if g[0].startswith("priority.")]
    fallback = [g for g in groups if g[0] == "fallback"]
    return priority + fallback


def match_keywords(query: str, rules: list[tuple[str, list[str], str]]) -> str | None:
    q = query.lower()
    for _group, patterns, skill in rules:
        if _group == "fallback":
            continue
        for p in patterns:
            if p.lower() in q:
                return skill
    return None


def load_index() -> dict:
    return json.loads(INDEX_PATH.read_text(encoding="utf-8"))


def build_classifier_prompt(query: str, index: dict) -> str:
    skill_list = "\n".join(f"- {s['id']}: {s['description']}" for s in index["skills"])
    template = index.get(
        "classifier_prompt_template",
        "Skills:\n{skill_list}\n\nUser message:\n{query}\n\nReturn only the skill id(s).",
    )
    return template.format(skill_list=skill_list, query=query)


def skill_path(skill_id: str) -> Path:
    return SKILLS_DIR / skill_id / "SKILL.md"


def main() -> None:
    parser = argparse.ArgumentParser(description="Sentinel specialist router")
    parser.add_argument("query", nargs="?", help="User message to route")
    parser.add_argument("--list", action="store_true", help="List available skills")
    parser.add_argument("--prompt", action="store_true", help="Emit classifier prompt instead of routing")
    parser.add_argument("--show-skill", action="store_true", help="Print the matched SKILL.md path and head")
    args = parser.parse_args()

    index = load_index()
    rules = load_rules()

    if args.list:
        for s in index["skills"]:
            path = skill_path(s["id"])
            status = "OK" if path.exists() else "MISSING"
            print(f"{s['id']:20} [{status}]  {s['description']}")
        return

    if not args.query:
        parser.print_help()
        sys.exit(1)

    if args.prompt:
        print(build_classifier_prompt(args.query, index))
        return

    matched = match_keywords(args.query, rules)
    if matched is None:
        # fallback
        matched = next((s for g, _, s in rules if g == "fallback"), "coordinator")

    print(f"skill: {matched}")

    path = skill_path(matched)
    if path.exists():
        print(f"path:  {path}")
        if args.show_skill:
            text = path.read_text(encoding="utf-8")
            print("---")
            print(text[:1200])
            if len(text) > 1200:
                print("...")
    else:
        print(f"path:  MISSING ({path})")


if __name__ == "__main__":
    main()
