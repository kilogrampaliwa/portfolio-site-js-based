#!/usr/bin/env bash
# Post-deploy smoke test: hits apps/web and apps/api-profile and confirms
# expected status codes.
#
# Required env vars:
#   WEB_URL            e.g. https://kilogrampaliwa.com
#   PROFILE_API_URL    e.g. https://api.kilogrampaliwa.com
#   PROFILE_API_KEY    a valid, non-revoked apps/api-profile API key
set -euo pipefail

check() {
  local description="$1" url="$2" expected="$3"
  shift 3
  local actual
  actual=$(curl -sL -o /dev/null -w "%{http_code}" "$@" "$url")
  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL: $description -> $url returned $actual, expected $expected"
    exit 1
  fi
  echo "OK:   $description -> $url returned $actual"
}

: "${WEB_URL:?WEB_URL is required}"
: "${PROFILE_API_URL:?PROFILE_API_URL is required}"
: "${PROFILE_API_KEY:?PROFILE_API_KEY is required}"

check "apps/web homepage" "$WEB_URL/en" 200
check "apps/api-profile health" "$PROFILE_API_URL/health" 200
check "apps/api-profile rejects missing API key" "$PROFILE_API_URL/about" 401
check "apps/api-profile accepts valid API key" "$PROFILE_API_URL/about" 200 \
  -H "X-API-Key: $PROFILE_API_KEY"

echo "All smoke checks passed."
