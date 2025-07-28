const { spawn } = require('child_process');
const { authenticator } = require('otplib');

// Load environment variables
const email = process.env.CSDX_EMAIL;
const password = process.env.CSDX_PASSWORD;
const secret = process.env.CSDX_TOTP_SECRET;

// Generate the TOTP code
const token = authenticator.generate(secret);

const login = spawn('csdx', ['auth:login', '-u', email, '-p', password], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
let channelSelected = false;
let otpSent = false;

login.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;

  // Filter out the repeated interactive prompts
  const filtered = text
    .replace(/.*Please select OTP channel.*/gi, '')
    .replace(/.*Please provide the security code.*/gi, '');

  // Print anything that's not a prompt
  if (filtered.trim()) {
    process.stdout.write(filtered);
  }

  // Handle OTP channel selection
  if (!channelSelected && buffer.includes('Please select OTP channel')) {
    channelSelected = true;
    setTimeout(() => {
      login.stdin.write('1\n'); // Select 'Authy App'
      console.log('\n✅ Selected OTP channel: Authy App');
    }, 300);
  }

  // Handle OTP code submission
  if (!otpSent && buffer.toLowerCase().includes('please provide the security code')) {
    otpSent = true;
    setTimeout(() => {
      login.stdin.write(token + '\n');
      console.log('\n🔐 OTP Code: ' + token);
    }, 400);
  }

  // Handle successful login
  if (text.toLowerCase().includes('successfully logged in')) {
    console.log('\n✅ Login successful!');
  }

  // Handle OTP failure
  if (text.toLowerCase().includes('two-factor authentication verification failed')) {
    console.error('\n❌ OTP verification failed');
  }
});

login.on('close', (code) => {
  console.log('\n🔚 Login process exited with code:', code);
  process.exit(code);
});
