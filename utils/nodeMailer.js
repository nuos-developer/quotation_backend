const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',   // Gmail SMTP host
  port: 587,                // Port 587 for TLS (STARTTLS)
  secure: false,            // false because we're using STARTTLS
  auth: {
    user: process.env.MAIL_USER, // your Gmail address
    pass: process.env.MAIL_PASS, // your App Password or Gmail password (if less secure apps allowed)
  },
  tls: {
    rejectUnauthorized: false, // equivalent to ignoreBadCertificate: false
  },
});

exports.sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"NUOS Home Automation:" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(` Email sent successfully to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Email sending failed:', error);
    return { success: false, error: error.message };
  }
};


exports.sendEmailWithCustomFrom = async (fromEmail, toEmail, subject, html) => {
  try {

    console.log('tomail',toEmail, 'form email', fromEmail);
    
    const info = await transporter.sendMail({
      from: `${fromEmail}`, // display user's email but send via system
      replyTo: fromEmail, // replies go to user
      to: toEmail,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};