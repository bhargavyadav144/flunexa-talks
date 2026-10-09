import dotenv from 'dotenv';
dotenv.config();

import { sendOtpEmail, sendWelcomeEmail } from './emailService.js';

async function testGmail() {
  console.log('Testing Gmail delivery with:', process.env.GMAIL_USER);
  try {
    const result = await sendOtpEmail({
      to: 'dmspark.support@gmail.com',
      name: 'Flunexa Admin',
      otp: '789123',
      type: 'signup',
    });
    console.log('✅ OTP email sent successfully! Message ID:', result.messageId);

    const welcomeResult = await sendWelcomeEmail({
      to: 'dmspark.support@gmail.com',
      name: 'Flunexa Admin',
      nativeLanguage: 'Telugu',
      level: 'B1',
    });
    console.log('✅ Welcome email sent successfully! Message ID:', welcomeResult.messageId);
    console.log('🎉 Gmail SMTP configuration is 100% verified and working!');
  } catch (err) {
    console.error('❌ Gmail send error:', err);
  }
}

testGmail();
