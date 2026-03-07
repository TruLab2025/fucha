// lib/email.ts
import nodemailer from 'nodemailer';

// przykładowa funkcja wysyłająca e-mail
export async function sendContactEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  // użyj Resend API lub SMTP
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@fucha24.com',
      to,
      subject,
      text,
    });
  } else {
    // TODO: implement resend api call
    console.warn('Email sending not configured');
  }
}
