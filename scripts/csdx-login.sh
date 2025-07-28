#!/usr/bin/env bash

EMAIL="${CSDX_EMAIL}"
PASSWORD="${CSDX_PASSWORD}"
TOTP_SECRET="${CSDX_TOTP_SECRET}"

OTP=$(node <<EOF
const { authenticator } = require('otplib');
console.log(authenticator.generate('${TOTP_SECRET}'));
EOF
)

echo "🔐 Generated OTP: $OTP"

expect <<EOF
spawn csdx auth:login -u "$EMAIL" -p "$PASSWORD"
expect "Please select OTP channel" { send "1\r" }
expect "Please provide the security code" { send "$OTP\r" }
expect "Successfully logged in" 
EOF
