import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const OTP_SENDER_EMAIL = 'noreply.bascart@gmail.com';
export const OTP_SENDER_NAME = 'BasCart Security';

interface OtpRecord {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  lastSentAt: number;
}

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'smtp-config.json');

// In-memory OTP storage
const otpRegistry = new Map<string, OtpRecord>();

// Transporter state
let emailTransporter: nodemailer.Transporter | null = null;
let currentConfig: SmtpConfig = {};
let lastDispatchError: string | null = null;

/**
 * Loads SMTP configuration from file or environment variables
 */
function loadSmtpConfiguration(): SmtpConfig {
  let fileConfig: SmtpConfig = {};
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      fileConfig = JSON.parse(data);
    } catch (e) {
      console.warn('[OTP Service] Failed to read smtp-config.json:', e);
    }
  }

  const pass = fileConfig.pass || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const user = fileConfig.user || process.env.SMTP_USER || process.env.EMAIL_FROM || OTP_SENDER_EMAIL;
  const host = fileConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = fileConfig.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465);
  const secure = fileConfig.secure !== undefined ? fileConfig.secure : (port === 465);

  return { host, port, secure, user, pass };
}

/**
 * Initializes or re-initializes the nodemailer transport
 */
export function initializeEmailTransporter(): boolean {
  try {
    currentConfig = loadSmtpConfiguration();

    if (!currentConfig.pass) {
      console.log(`[OTP Service] No SMTP password or Gmail App Password configured yet for ${currentConfig.user}.`);
      emailTransporter = null;
      return false;
    }

    emailTransporter = nodemailer.createTransport({
      host: currentConfig.host,
      port: currentConfig.port,
      secure: currentConfig.secure,
      auth: {
        user: currentConfig.user,
        pass: currentConfig.pass,
      },
    });

    console.log(`[OTP Service] Initialized nodemailer transporter for ${currentConfig.user} (${currentConfig.host}:${currentConfig.port})`);
    return true;
  } catch (err: any) {
    console.warn(`[OTP Service] Could not initialize nodemailer: ${err.message}`);
    emailTransporter = null;
    return false;
  }
}

// Initial bootstrap
initializeEmailTransporter();

/**
 * Generates an HTML formatted email for the OTP dispatch
 */
function createOtpEmailTemplate(email: string, code: string): { subject: string; text: string; html: string } {
  const subject = `${code} is your BasCart verification code`;
  const text = `Your BasCart login verification code is ${code}. It expires in 5 minutes. Dispatched from ${OTP_SENDER_EMAIL}.`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; margin: 0; padding: 20px; color: #1c1917; }
          .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #1c1917; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
          .tagline { font-size: 13px; color: #78716c; margin-bottom: 24px; font-style: italic; }
          .code-box { background: #f5f5f4; border: 1px solid #d6d3d1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .code { font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1c1917; }
          .expiry { font-size: 12px; color: #78716c; margin-top: 8px; }
          .footer { font-size: 11px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">BasCart</div>
          <p class="tagline">“Your cart is full. Your wallet isn’t.”</p>
          <p style="font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.5;">Use the following single-use verification code to authenticate your BasCart account:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="expiry">Valid for 5 minutes · Dispatched from ${OTP_SENDER_EMAIL}</div>
          </div>

          <p style="font-size: 12px; color: #57534e;">If you did not request this verification code, please disregard this email.</p>
          
          <div class="footer">
            Dispatched securely by BasCart Identity Service.<br>
            Sender Identity: <strong>${OTP_SENDER_EMAIL}</strong><br>
            BasCart is a simulated shopping experience. Virtual BasCash has no real-world monetary value.
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
}

export class OtpService {
  /**
   * Generates and dispatches a 6-digit OTP code to the requested email.
   */
  public static async generateAndSendOtp(email: string): Promise<{
    success: boolean;
    from: string;
    email: string;
    expiresInSeconds: number;
    debugCode: string;
    message: string;
    emailSent: boolean;
    emailDeliveryError: string | null;
  }> {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    const now = Date.now();
    const existing = otpRegistry.get(normalizedEmail);

    // Anti-spam cooldown: 10 seconds
    if (existing && now - existing.lastSentAt < 10000) {
      const waitRemaining = Math.ceil((10000 - (now - existing.lastSentAt)) / 1000);
      throw new Error(`Please wait ${waitRemaining} seconds before requesting a new code.`);
    }

    // Cryptographically secure 6-digit code
    const randomInt = crypto.randomInt(100000, 999999);
    const code = randomInt.toString();
    const validityDurationMs = 5 * 60 * 1000; // 5 minutes
    const expiresAt = now + validityDurationMs;

    // Save record
    otpRegistry.set(normalizedEmail, {
      code,
      email: normalizedEmail,
      createdAt: now,
      expiresAt,
      attempts: 0,
      verified: false,
      lastSentAt: now,
    });

    const emailContent = createOtpEmailTemplate(normalizedEmail, code);
    let emailSent = false;
    let emailDeliveryError: string | null = null;

    // Attempt dispatch via SMTP transporter if available
    if (emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: `"${OTP_SENDER_NAME}" <${currentConfig.user || OTP_SENDER_EMAIL}>`,
          to: normalizedEmail,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });
        emailSent = true;
        lastDispatchError = null;
        console.log(`[OTP Service] Email successfully sent to ${normalizedEmail} via SMTP!`);
      } catch (smtpErr: any) {
        emailSent = false;
        emailDeliveryError = smtpErr.message || 'SMTP dispatch error';
        lastDispatchError = emailDeliveryError;
        console.warn(`[OTP Service] Live SMTP delivery failed (${smtpErr.message}). Debug code provided.`);
      }
    } else {
      emailDeliveryError = `SMTP credentials not yet configured for ${OTP_SENDER_EMAIL}. (Add Gmail App Password in Admin Portal or .env)`;
      lastDispatchError = emailDeliveryError;
    }

    // Console Dispatch Log (tamper-evident audit)
    console.log(`\n=============================================================`);
    console.log(`[OTP DISPATCH SYSTEM]`);
    console.log(`FROM:        "${OTP_SENDER_NAME}" <${currentConfig.user || OTP_SENDER_EMAIL}>`);
    console.log(`TO:          ${normalizedEmail}`);
    console.log(`SUBJECT:     ${emailContent.subject}`);
    console.log(`CODE:        ${code}`);
    console.log(`LIVE SENT:   ${emailSent ? 'YES' : 'NO'}`);
    if (emailDeliveryError) {
      console.log(`NOTICE:      ${emailDeliveryError}`);
    }
    console.log(`EXPIRES:     5 minutes (${new Date(expiresAt).toLocaleTimeString()})`);
    console.log(`=============================================================\n`);

    return {
      success: true,
      from: currentConfig.user || OTP_SENDER_EMAIL,
      email: normalizedEmail,
      expiresInSeconds: 300,
      debugCode: code,
      emailSent,
      emailDeliveryError,
      message: emailSent
        ? `Verification code delivered to your inbox from ${OTP_SENDER_EMAIL}`
        : `Verification code generated. (SMTP setup notice: ${emailDeliveryError})`,
    };
  }

  /**
   * Verifies the 6-digit OTP code.
   */
  public static verifyOtp(email: string, inputCode: string): {
    valid: boolean;
    error?: string;
  } {
    const normalizedEmail = email.toLowerCase().trim();
    const entry = otpRegistry.get(normalizedEmail);

    if (!entry) {
      return { valid: false, error: 'No verification code found. Please request a new code.' };
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      otpRegistry.delete(normalizedEmail);
      return { valid: false, error: 'Verification code has expired. Please request a new one.' };
    }

    entry.attempts += 1;
    if (entry.attempts > 5) {
      otpRegistry.delete(normalizedEmail);
      return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' };
    }

    const cleanInput = inputCode.trim();
    if (entry.code !== cleanInput) {
      return {
        valid: false,
        error: `Incorrect code. ${5 - entry.attempts} attempt(s) remaining.`,
      };
    }

    // Mark as verified and invalidate so it cannot be re-used
    entry.verified = true;
    otpRegistry.delete(normalizedEmail);

    return { valid: true };
  }

  /**
   * Returns current SMTP status & diagnostics
   */
  public static getSmtpStatus() {
    return {
      isConfigured: !!emailTransporter && !!currentConfig.pass,
      senderEmail: currentConfig.user || OTP_SENDER_EMAIL,
      senderName: OTP_SENDER_NAME,
      host: currentConfig.host || 'smtp.gmail.com',
      port: currentConfig.port || 465,
      secure: currentConfig.secure ?? true,
      hasPassword: !!currentConfig.pass,
      lastDispatchError,
    };
  }

  /**
   * Updates SMTP config and reloads transporter
   */
  public static async saveSmtpConfig(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
    try {
      const mergedConfig: SmtpConfig = {
        host: config.host || 'smtp.gmail.com',
        port: config.port ? Number(config.port) : 465,
        secure: config.secure !== undefined ? Boolean(config.secure) : true,
        user: config.user || OTP_SENDER_EMAIL,
        pass: config.pass || '',
      };

      // Test transporter connection
      if (mergedConfig.pass) {
        const testTransporter = nodemailer.createTransport({
          host: mergedConfig.host,
          port: mergedConfig.port,
          secure: mergedConfig.secure,
          auth: {
            user: mergedConfig.user,
            pass: mergedConfig.pass,
          },
        });

        await testTransporter.verify();
      }

      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(mergedConfig, null, 2), 'utf-8');
      initializeEmailTransporter();

      return {
        success: true,
        message: 'SMTP settings successfully validated and saved.',
      };
    } catch (err: any) {
      throw new Error(`SMTP validation failed: ${err.message}`);
    }
  }

  /**
   * Sends a test email to verify end-to-end delivery
   */
  public static async sendTestEmail(toEmail: string): Promise<{ success: boolean; message: string }> {
    if (!emailTransporter) {
      throw new Error('SMTP is not initialized. Please configure Gmail App Password first.');
    }

    const testCode = '742910';
    const emailContent = createOtpEmailTemplate(toEmail, testCode);

    await emailTransporter.sendMail({
      from: `"${OTP_SENDER_NAME}" <${currentConfig.user || OTP_SENDER_EMAIL}>`,
      to: toEmail,
      subject: `[Test Verification] ${emailContent.subject}`,
      text: emailContent.text,
      html: emailContent.html,
    });

    return {
      success: true,
      message: `Test email successfully dispatched to ${toEmail} from ${currentConfig.user || OTP_SENDER_EMAIL}!`,
    };
  }
}
