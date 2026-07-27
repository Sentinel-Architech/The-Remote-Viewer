# Scripts

## rename-concepts.sh

Automates moving the remaining root-level concept / design documents into `docs/concepts/` with clean kebab-case Markdown names.

```bash
# Dry-run (safe — only prints what would happen)
./scripts/rename-concepts.sh

# Actually perform the moves
./scripts/rename-concepts.sh --apply
```

After applying, review the changes and commit:

```bash
git add docs/concepts/ scripts/
git status
git commit -m "chore: move remaining concept docs into docs/concepts/"
```

The script never overwrites existing targets and skips any source file that is already gone.
