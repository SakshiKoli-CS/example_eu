#!/usr/bin/expect -f

# Get command-line arguments
set email [lindex $argv 0]
set password [lindex $argv 1]
set totp_secret [lindex $argv 2]

# Generate OTP using otplib
set otp [exec node -e "const { authenticator } = require('otplib'); console.log(authenticator.generate('${totp_secret}'))"]

# Start login
spawn csdx auth:login -u $email -p $password --otp $otp
expect {
  "Successfully logged in!!" {
    puts "✅ Login successful"
  }
  timeout {
    puts "❌ Login timed out"
    exit 1
  }
  eof {
    puts "✅ Login script finished"
  }
}

# Immediately deploy
spawn csdx launch --redeploy-latest
expect {
  timeout {
    puts "❌ Deploy timed out"
    exit 1
  }
  eof {
    puts "✅ Deploy finished"
  }
}
