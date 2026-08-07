#!/usr/bin/env bash
# IA-of-IA MoE — domain router (parallel to Sentinel moe-router)
# Usage: route-domain.sh "user question text"
set -euo pipefail

Q="${*:-}"
Q_LOWER="$(printf '%s' "$Q" | tr '[:upper:]' '[:lower:]')"

domain="general"

# Finances first (money terms are specific)
if printf '%s' "$Q_LOWER" | grep -Eq 'price|market|usd|stock|bond|inflation|interest rate|gdp|revenue|balance sheet|portfolio|exchange rate|crypto|bitcoin|fed |ecb|treasury|dividend|earnings'; then
  domain="finances"
elif printf '%s' "$Q_LOWER" | grep -Eq 'research|study|paper|doi|arxiv|hypothesis|experiment|replication|dataset|peer.review|citation|methodology'; then
  domain="research"
elif printf '%s' "$Q_LOWER" | grep -Eq 'learn|teach|student|curriculum|lesson|exam|course|tutor|homework|pedagog|school|university|explain for beginners'; then
  domain="education"
fi

# ISO-ish timestamp for downstream "as of" stamps
as_of="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

printf 'domain=%s\n' "$domain"
printf 'as_of=%s\n' "$as_of"
printf 'stack=ia-of-ia\n'
printf 'parallel_to=sentinel-moe\n'
printf 'mission=education,research,finances realtime accuracy\n'
