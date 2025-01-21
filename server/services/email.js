import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { MAILER_SEND_TOKEN } from '../config.js';

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
    .setHtml(`
      <p>Hello ${details.contact_name},</p>
      <p>Thank you for contacting us. Here are your submission details:</p>
      <ul>
        <li>Name: ${details.name}</li>
        <li>Email: ${details.email}</li>
        <li>Phone: ${details.phone}</li>
      </ul>
      <p>We'll be in touch soon!</p>
    `);

  try {
    await mailerSend.email.send(emailParams);
    console.log('Lead confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending lead confirmation email:', error);
    throw error;
  }
}

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