import dotenv from 'dotenv';
dotenv.config();

export const COOKIE_TOKEN = 'authToken';
export const ResetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/`;
