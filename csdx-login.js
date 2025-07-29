const { spawn } = require('child_process');
const { authenticator } = require('otplib');

const email = process.env.CSDX_EMAIL;
const password = process.env.CSDX_PASSWORD;
const secret = process.env.CSDX_TOTP_SECRET;
const token = authenticator.generate(secret);

async function start() {
  const proc = spawnLoginProcess();
  await waitForOtpPrompt(proc);
  await chooseAuthy(proc);
  await submitOtp(proc);
}

start();

function spawnLoginProcess() {
  return spawn('csdx', ['auth:login', '-u', email, '-p', password], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });
}

function waitForOtpPrompt(proc) {
  return new Promise((resolve) => {
    proc.stdout.on('data', (data) => {
      const text = data.toString();

      if (text.includes('Please select OTP channel')) {
        resolve();
      }
    });
  });
}

function chooseAuthy(proc) {
  return new Promise((resolve) => {
    setTimeout(() => {
      proc.stdin.write('1\n');
      console.log('\n Selected OTP channel: Authy App');
      resolve();
    }, 300);
  });
}

function submitOtp(proc) {
  return new Promise((resolve) => {
    let sentOtp = false;
    let loginDone = false;

    proc.stdout.on('data', (data) => {
      const text = data.toString();

      if (!sentOtp && text.toLowerCase().includes('please provide the security code')) {
        sentOtp = true;
        proc.stdin.write(token + '\n');
        console.log('\n🔐 OTP Code:', token);
      }

      if (!loginDone && text.toLowerCase().includes('successfully logged in')) {
        loginDone = true;
        console.log('\n Login successful!');
        resolve();
      }

      if (text.toLowerCase().includes('two-factor authentication verification failed')) {
        console.error('\n OTP verification failed');
        resolve();
      }
    });

    proc.on('close', (code) => {
      console.log('\n Login process exited with code:', code);
    });
  });
}
