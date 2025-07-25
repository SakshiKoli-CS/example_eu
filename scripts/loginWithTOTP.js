// scripts/loginWithTOTP.js
const axios = require('axios')
const dotenv = require('dotenv')
const { authenticator } = require('otplib')

dotenv.config()

const { CSDX_EMAIL, CSDX_PASSWORD, CSDX_TOTP_SECRET } = process.env

if (!CSDX_EMAIL || !CSDX_PASSWORD || !CSDX_TOTP_SECRET) {
  console.error('❌ Missing required .env values')
  process.exit(1)
}

async function login() {
  try {
    const otp = authenticator.generate(CSDX_TOTP_SECRET)
    console.log(`🔐 Generated OTP: ${otp}`)

    console.log('📡 Sending login request...')
    const response = await axios.post(
      'https://eu-api.contentstack.com/v3/user-session',
      {
        user: {
          email: CSDX_EMAIL,
          password: CSDX_PASSWORD,
          otp,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const authtoken = response.headers['authtoken']
    console.log('✅ Login successful!')
    console.log('🔑 AuthToken:', authtoken)
  } catch (error) {
    if (error.response) {
      console.error('❌ Login failed.')
      console.error(error.response.data)
    } else {
      console.error('❌ Unexpected error:', error.message)
    }
  }
}

login()
