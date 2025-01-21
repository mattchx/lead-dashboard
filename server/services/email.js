import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import dotenv from 'dotenv';
dotenv.config();

const MAILER_SEND_TOKEN = process.env.MAILER_SEND_TOKEN;

const mailerSend = new MailerSend({
  apiKey: MAILER_SEND_TOKEN
});

const sender = new Sender('no-reply@yourdomain.com', 'Lead Dashboard');

export async function sendLeadConfirmation(details) {
  const recipients = [new Recipient(details.email)];
  
  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject('Thank you for your submission')
    .setHtml(
      confirmationTemplate
        .replace(/{{name}}/g, details.name)
        .replace(/{{email}}/g, details.email)
        .replace(/{{phone}}/g, details.phone)
        .replace(/{{contact_name}}/g, details.contact_name)
    );

  try {
    await mailerSend.email.send(emailParams);
    console.log('Lead confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending lead confirmation email:', error);
    throw error;
  }
}
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
      <h2 class="header">Thank you for your submission!</h2>
      <div class="details">
        <p>We've received your information and will be in touch soon.</p>
        <p>Here's what you submitted:</p>
        <ul>
          <li><strong>Name:</strong> {{name}}</li>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Phone:</strong> {{phone}}</li>
          <li><strong>Preferred Contact:</strong> {{contact_name}}</li>
        </ul>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us at info@yourclinic.com</p>
      </div>
    </div>
  </body>
  </html>
`;

const dentistTemplate = `
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

export async function sendAdminNotification(leadDetails) {
  const recipients = [new Recipient('admin@yourdomain.com')];
  
  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject('New Lead Submission')
    .setHtml(`
      <p>New lead submission received:</p>
      <ul>
        <li>Name: ${leadDetails.name}</li>
        <li>Email: ${leadDetails.email}</li>
        <li>Phone: ${leadDetails.phone}</li>
        <li>Contact Name: ${leadDetails.contact_name}</li>
        <li>Contact Email: ${leadDetails.contact_email}</li>
      </ul>
    `);

  try {
    await mailerSend.email.send(emailParams);
    console.log('Admin notification email sent');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
}

export async function sendDentistNotification(details, dentistEmail) {
  const recipients = [new Recipient(dentistEmail)];
  
  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject('New Lead Notification')
    .setHtml(
      dentistTemplate
        .replace(/{{name}}/g, details.name)
        .replace(/{{email}}/g, details.email)
        .replace(/{{phone}}/g, details.phone)
        .replace(/{{contact_name}}/g, details.contact_name)
        .replace(/{{contact_email}}/g, details.contact_email)
    );

  try {
    await mailerSend.email.send(emailParams);
    console.log('Dentist notification email sent to:', dentistEmail);
  } catch (error) {
    console.error('Error sending dentist notification email:', error);
    throw error;
  }
}