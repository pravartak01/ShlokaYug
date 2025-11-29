/**
 * Email Utility
 * Handles sending emails for verification, password reset, notifications, etc.
 */

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  let transporter;
  
  if (process.env.NODE_ENV === 'production') {
    // Production - Use real email service
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development - Use Ethereal (fake email service)
    transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
  
  // 2) Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'ShlokaYug'} <${process.env.EMAIL_FROM || 'noreply@shlokayu.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message
  };
  
  // 3) Actually send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent successfully!');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;