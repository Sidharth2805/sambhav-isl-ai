import emailjs from '@emailjs/browser';

/**
 * Utility for sending OTP emails via official @emailjs/browser SDK and REST API fallback
 */

export interface SendOtpParams {
  toEmail: string;
  toName?: string;
  otpCode: string;
}

export async function sendOtpEmail({ toEmail, toName, otpCode }: SendOtpParams): Promise<boolean> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_j31vn0c';
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_0gz7plg';
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'u7bZ7Kz3ktpmAJJkQ';

  const recipientName = toName || toEmail.split('@')[0];

  // Comprehensive template parameters matching any common variable name in EmailJS template
  const templateParams = {
    to_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    reply_to: toEmail,
    to_name: recipientName,
    name: recipientName,
    user_name: recipientName,
    otp_code: otpCode,
    otp: otpCode,
    code: otpCode,
    message: `Your SAMBHAV verification code is: ${otpCode}. Valid for 10 minutes.`,
    app_name: 'SAMBHAV / SignBridge ISL AI',
  };

  // 1. Try official browser SDK first
  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    if (response.status === 200 || response.text === 'OK') {
      console.log('[SAMBHAV EmailJS] OTP email dispatched successfully to:', toEmail);
      return true;
    }
  } catch (sdkErr: any) {
    console.warn('[SAMBHAV EmailJS SDK Notice]:', sdkErr?.text || sdkErr?.message || sdkErr);
  }

  // 2. Fallback to direct REST API
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      console.log('[SAMBHAV EmailJS REST] OTP email dispatched successfully to:', toEmail);
      return true;
    }
    const errText = await response.text();
    console.warn('[SAMBHAV EmailJS REST Error]:', errText);
  } catch (fetchErr) {
    console.warn('[SAMBHAV EmailJS Fetch Error]:', fetchErr);
  }

  return false;
}
