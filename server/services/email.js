import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create SES client
const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Create Nodemailer transport
const transporter = nodemailer.createTransport({
  SES: { 
    ses,
    aws: { SendRawEmailCommand }
  }
});

const sender = '"Find Pros" <info@findpros.site>';

const confirmationTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 20px; }
      .header { color: #333; }
      .details { margin: 20px 0; }
      .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2 class="header">Thank you for booking!</h2>
      <div class="details">
        <p>We've received your booking request and will be in touch soon.</p>
        <p>Thanks for choosing to book with {{contact_name}}.</p>
      </div>
    </div>
  </body>
  </html>
`;

const providerTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 20px; }
      .header { color: #333; }
      .details { margin: 20px 0; }
      .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2 class="header">New Lead Notification</h2>
      <div class="details">
        <p>A new lead has been submitted:</p>
        <ul>
          <li><strong>Name:</strong> {{name}}</li>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Phone:</strong> {{phone}}</li>
          <li><strong>Preferred Contact:</strong> {{contact_name}}</li>
          <li><strong>Contact Email:</strong> {{contact_email}}</li>
        </ul>
      </div>
      <div class="footer">
        <a href="mailto:{{email}}" class="button">Contact Lead</a>
      </div>
    </div>
  </body>
  </html>
`;

export async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: sender,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendLeadConfirmation(details) {
  const mailOptions = {
    from: sender,
    to: details.email,
    subject: 'Thank you for contacting ' + details.contact_name,
    html: confirmationTemplate
      .replace(/{{contact_name}}/g, details.contact_name)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Lead confirmation email sent to:', details.email);
  } catch (error) {
    console.error('Error sending lead confirmation email:', error);
    throw error;
  }
}

export async function sendAdminNotification(leadDetails) {
  const mailOptions = {
    from: sender,
    to: 'admin@yourdomain.com',
    subject: 'New Lead Submission',
    html: `
      <p>New lead submission received:</p>
      <ul>
        <li>Name: ${leadDetails.name}</li>
        <li>Email: ${leadDetails.email}</li>
        <li>Phone: ${leadDetails.phone}</li>
        <li>Contact Name: ${leadDetails.contact_name}</li>
        <li>Contact Email: ${leadDetails.contact_email}</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
}

export async function sendProviderNotification(details, providerEmail) {
  const mailOptions = {
    from: sender,
    to: providerEmail,
    subject: 'New Lead Notification',
    html: providerTemplate
      .replace(/{{name}}/g, details.name)
      .replace(/{{email}}/g, details.email)
      .replace(/{{phone}}/g, details.phone)
      .replace(/{{contact_name}}/g, details.contact_name)
      .replace(/{{contact_email}}/g, details.contact_email)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Provider notification email sent to:', providerEmail);
  } catch (error) {
    console.error('Error sending provider notification email:', error);
    throw error;
  }
}