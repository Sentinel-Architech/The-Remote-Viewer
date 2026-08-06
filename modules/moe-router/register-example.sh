#!/data/data/com.termux/files/usr/bin/bash
# Example: how to extend the registry (edit experts.json by hand for real use)
set -euo pipefail
echo "Edit modules/moe-router/experts.json to add experts."
echo "Required fields: id, tags[], command"
echo "Keep commands local. Do not register cloud endpoints as core experts."
