#!/usr/bin/env bash

set -e

EMAIL="${CSDX_EMAIL}"
PASSWORD="${CSDX_PASSWORD}"
TOTP_SECRET="${CSDX_TOTP_SECRET}"

if [[ -z "$EMAIL" || -z "$PASSWORD" || -z "$TOTP_SECRET" ]]; then
  echo "❌ One or more required environment variables (CSDX_EMAIL, CSDX_PASSWORD, CSDX_TOTP_SECRET) are missing."
  exit 1
fi

# Generate TOTP code
TOTP=$(node -e "console.log(require('otplib').authenticator.generate('$TOTP_SECRET'))")

# Debug logging
echo "🟢 Generated TOTP code. Proceeding to login..."

# Use expect to automate TOTP input
expect <<EOF
spawn csdx auth:login -u $EMAIL -p $PASSWORD
expect "Enter the Two-Factor authentication token:"
send "$TOTP\r"
expect eof
EOF
