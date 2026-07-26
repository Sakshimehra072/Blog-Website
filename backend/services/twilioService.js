const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (accountSid && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Twilio SDK initialization failed:', err.message);
  }
}

async function sendTwilioOtp(phoneNumber, otpCode) {
  if (twilioClient && fromPhone) {
    try {
      const message = await twilioClient.messages.create({
        body: `[BlogVerse] Your verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: fromPhone,
        to: phoneNumber
      });
      console.log(`📱 Twilio SMS dispatched SID: ${message.sid}`);
      return { success: true, mode: 'twilio', sid: message.sid };
    } catch (error) {
      console.error('❌ Twilio SMS Error:', error.message);
      // Fall through to dev mode log
    }
  }

  // Dev mode logging fallback
  console.log(`\n==========================================`);
  console.log(`📱 [DEV TWILIO OTP SERVICE]`);
  console.log(`To Phone Number: ${phoneNumber}`);
  console.log(`🔑 Verification Code OTP: ${otpCode}`);
  console.log(`(Use code ${otpCode} in the frontend modal)`);
  console.log(`==========================================\n`);

  return { success: true, mode: 'dev_mock', otp: otpCode };
}

module.exports = {
  sendTwilioOtp
};
