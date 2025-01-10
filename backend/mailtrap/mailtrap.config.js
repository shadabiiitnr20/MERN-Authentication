import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

export const mailTrapClient = new MailtrapClient({
  token: process.env.TOKEN,
});

export const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Shadab Mailtrap',
};
