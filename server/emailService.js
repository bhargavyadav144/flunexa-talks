import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

// Initialize and verify mail transporter
export async function initEmailTransporter() {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER || 'dmspark.support@gmail.com';
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || 'rofksbmgfpmjucnf').replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    try {
      await transporter.verify();
      console.log(`[Email] ✅ Gmail SMTP authenticated successfully for: ${gmailUser}`);
      return transporter;
    } catch (err) {
      console.error(`[Email] ⚠️ Gmail SMTP authentication error:`, err.message);
    }
  }

  // Fallback to Ethereal if Gmail fails
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Initialized fallback Ethereal account: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn('[Email] Fallback mailer error:', err.message);
    transporter = {
      sendMail: async () => ({ messageId: `mock-${Date.now()}` }),
    };
    return transporter;
  }
}

const EMAIL_SENDER = process.env.EMAIL_FROM || '"Flunexa Talk" <dmspark.support@gmail.com>';

/**
 * 1. SEND REAL OTP EMAIL (Sign-up or Password Reset)
 */
export async function sendOtpEmail({ to, name = 'Learner', otp, type = 'signup' }) {
  const mailer = await initEmailTransporter();
  const isSignUp = type === 'signup';
  const subject = isSignUp
    ? `🔐 ${otp} is your Flunexa Talk Verification Code`
    : `🔑 ${otp} is your Flunexa Talk Password Reset Code`;

  const title = isSignUp ? 'Welcome to Flunexa Talk!' : 'Reset Your Flunexa Talk Password';
  const description = isSignUp
    ? 'Use the verification code below to verify your email and activate your personal AI English coach.'
    : 'We received a request to recover your password. Use the verification code below to set a new password, or choose to skip to log straight into the app.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 14px 40px rgba(0,0,0,0.6); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); padding: 36px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; color: rgba(255,255,255,0.92); font-size: 14px; font-weight: 500; }
        .content { padding: 36px 28px; }
        .badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; margin-bottom: 18px; border: 1px solid rgba(129, 140, 248, 0.3); }
        .greeting { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #f8fafc; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: rgba(99, 102, 241, 0.1); border: 2px dashed #818cf8; border-radius: 14px; padding: 26px; text-align: center; margin: 26px 0; }
        .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; font-family: 'Courier New', monospace; }
        .expiry { font-size: 13px; color: #f43f5e; margin-top: 12px; font-weight: 600; }
        .footer { background: #080d1a; padding: 22px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Flunexa Talk</h1>
          <p>Speak. Improve. Become Fluent.</p>
        </div>
        <div class="content">
          <div class="badge">${isSignUp ? '✨ Account Activation' : '🛡️ Security Verification'}</div>
          <div class="greeting">Hello ${name}! 👋</div>
          <p class="text">${description}</p>
          
          <div class="otp-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; margin-bottom: 8px;">Your One-Time Passcode</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏱️ Valid for 10 minutes</div>
          </div>

          <p class="text" style="font-size: 13px; margin-bottom: 0;">
            Never share this OTP with anyone. Flunexa Talk team members will never ask for your code.
          </p>
        </div>
        <div class="footer">
          Sent by <strong>Flunexa Talk Support</strong> • dmspark.support@gmail.com<br />
          © ${new Date().getFullYear()} Flunexa Talk AI Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return mailer.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    text: `${title}\n\nYour OTP code is: ${otp}\nValid for 10 minutes.\n\nFlunexa Talk Team`,
    html,
  });
}

/**
 * 2. SEND WELCOME TO THE APP EMAIL
 */
export async function sendWelcomeEmail({ to, name = 'Learner', nativeLanguage = 'Telugu', level = 'B1' }) {
  const mailer = await initEmailTransporter();
  const subject = `🎉 Welcome to Flunexa Talk, ${name}! Your AI Speaking Journey Begins`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 14px 40px rgba(0,0,0,0.6); }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 50%, #38bdf8 100%); padding: 36px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; }
        .header p { margin: 6px 0 0; color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 600; }
        .content { padding: 36px 28px; }
        .greeting { font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #f8fafc; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
        .feature-box { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 20px; margin: 20px 0; }
        .feature-item { display: flex; align-items: flex-start; margin-bottom: 14px; font-size: 14px; color: #e2e8f0; }
        .feature-item:last-child { margin-bottom: 0; }
        .feature-icon { font-size: 18px; margin-right: 12px; }
        .profile-pill { display: inline-block; background: #1e1b4b; border: 1px solid #6366f1; color: #c7d2fe; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin: 8px 0 20px; }
        .cta-btn { display: block; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; font-size: 16px; font-weight: 800; padding: 15px 24px; border-radius: 12px; margin: 26px 0 10px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        .footer { background: #080d1a; padding: 22px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Welcome to Flunexa Talk!</h1>
          <p>Meet Nexa — Your Funny & Interactive AI English Tutor</p>
        </div>
        <div class="content">
          <div class="greeting">Congratulations, ${name}! 🚀</div>
          <p class="text">
            Your account is verified and ready. From now on, you never have to feel hesitant or shy when speaking English. Nexa is here to practice with you 24/7!
          </p>

          <div class="profile-pill">
            🎯 Level: <strong>${level}</strong> • Explanations: <strong>${nativeLanguage}</strong>
          </div>

          <div class="feature-box">
            <div style="font-weight: 800; font-size: 15px; color: #34d399; margin-bottom: 12px;">🌟 What You Can Do Right Now:</div>
            <div class="feature-item">
              <span class="feature-icon">🎙️</span>
              <div><strong>Nexa Voice Call:</strong> Full-screen talk with real-time speech reactions and smart bottom chat ticker.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⏱️</span>
              <div><strong>Daily 10 Challenge:</strong> 10 minutes a day to lock in your daily speaking streak.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📝</span>
              <div><strong>5 Speaking Assessment Tests:</strong> Read Aloud, Repeat After AI, Picture Description & Topic Wheel.</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💾</span>
              <div><strong>AI Smart Saved Chats:</strong> Automatically analyzed topics with key vocabulary takeaways.</div>
            </div>
          </div>

          <a href="http://localhost:5173" class="cta-btn">Start Speaking With Nexa Free →</a>
        </div>
        <div class="footer">
          Sent by <strong>Flunexa Talk Support</strong> • dmspark.support@gmail.com<br />
          Need help? Reply directly to this email anytime.
        </div>
      </div>
    </body>
    </html>
  `;

  return mailer.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    text: `Welcome to Flunexa Talk, ${name}!\n\nYour account is active. Start practicing daily 10-minute speaking sessions with Nexa AI robot.\n\nFlunexa Talk Team`,
    html,
  });
}

/**
 * 3. SEND LOGIN NOTIFICATION EMAIL
 */
export async function sendLoginNotificationEmail({ to, name = 'Learner' }) {
  const mailer = await initEmailTransporter();
  const time = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const subject = `🔔 Security Notice: Successful Login to Flunexa Talk`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; }
        .header { background: #1f2937; padding: 24px; text-align: center; border-bottom: 1px solid #374151; }
        .content { padding: 32px 28px; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; }
        .box { background: rgba(255,255,255,0.04); border: 1px solid #374151; border-radius: 12px; padding: 16px; margin: 20px 0; }
        .footer { background: #080d1a; padding: 18px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; color: #fff;">🤖 Flunexa Talk Account Security</h2>
        </div>
        <div class="content">
          <h3 style="color: #fff; margin-top: 0;">Hello ${name},</h3>
          <p class="text">We detected a successful login to your Flunexa Talk account.</p>
          <div class="box">
            <div style="font-size: 13px; color: #cbd5e1;"><strong>Time:</strong> ${time}</div>
            <div style="font-size: 13px; color: #cbd5e1; margin-top: 6px;"><strong>Status:</strong> Authenticated via Session Token</div>
          </div>
          <p class="text" style="font-size: 13px;">
            If this was you, you can safely ignore this email. If you did not log in, please reset your password immediately.
          </p>
        </div>
        <div class="footer">
          Flunexa Talk Support • dmspark.support@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  return mailer.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    text: `Hello ${name},\n\nA successful login to your Flunexa Talk account was recorded at ${time}.\n\nFlunexa Talk Team`,
    html,
  });
}

/**
 * 4. SEND PASSWORD CHANGED CONFIRMATION EMAIL
 */
export async function sendPasswordChangedEmail({ to, name = 'Learner' }) {
  const mailer = await initEmailTransporter();
  const subject = `🔒 Security Alert: Your Flunexa Talk Password Was Updated`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 28px; text-align: center; color: #fff; }
        .content { padding: 32px 28px; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; }
        .footer { background: #080d1a; padding: 18px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Password Successfully Updated</h2>
        </div>
        <div class="content">
          <h3 style="color: #fff; margin-top: 0;">Hello ${name},</h3>
          <p class="text">
            Your Flunexa Talk account password has been successfully changed. You can now use your new password to log in across all devices.
          </p>
          <p class="text" style="font-size: 13px;">
            If you did not perform this action, please reach out to our support team at <strong>dmspark.support@gmail.com</strong> immediately.
          </p>
        </div>
        <div class="footer">
          Flunexa Talk Security • dmspark.support@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  return mailer.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    text: `Hello ${name},\n\nYour Flunexa Talk password was updated successfully.\n\nFlunexa Talk Team`,
    html,
  });
}

/**
 * 5. SEND PLAN UPGRADE CONFIRMATION EMAIL
 */
export async function sendPlanUpgradedEmail({ to, name = 'Learner', planName = 'Pro Fluency', billingCycle = 'yearly' }) {
  const mailer = await initEmailTransporter();
  const subject = `👑 Congratulations! Your Flunexa Talk ${planName} Plan is Active`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 24px auto; background: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%); padding: 32px 24px; text-align: center; color: #fff; }
        .content { padding: 32px 28px; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; }
        .box { background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .footer { background: #080d1a; padding: 18px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 26px;">🎉 Plan Upgraded!</h2>
          <p style="margin: 6px 0 0; opacity: 0.95;">Welcome to Flunexa ${planName}</p>
        </div>
        <div class="content">
          <h3 style="color: #fff; margin-top: 0;">Hello ${name}! 👋</h3>
          <p class="text">
            Thank you for upgrading! Your subscription to <strong>${planName} (${billingCycle})</strong> has been successfully activated.
          </p>
          <div class="box">
            <div style="font-weight: 800; color: #fbbf24; margin-bottom: 8px;">👑 Your Unlocked Benefits:</div>
            <div style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
              • Unlimited speaking practice with Nexa AI robot<br />
              • All 5 certified assessment speaking tests<br />
              • Deep native language explanations in 8+ languages<br />
              • Instant smart chat title analysis & permanent archive<br />
              • Priority AI speech synthesis & no daily limits
            </div>
          </div>
          <p class="text" style="font-size: 13px;">
            Enjoy your accelerated fluency journey. We are cheering for your speaking confidence!
          </p>
        </div>
        <div class="footer">
          Flunexa Talk Billing • dmspark.support@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  return mailer.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    text: `Hello ${name},\n\nYour Flunexa Talk ${planName} plan is active! Enjoy unlimited speaking time.\n\nFlunexa Talk Team`,
    html,
  });
}
