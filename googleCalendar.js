import { google } from 'googleapis';

export const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.CALENDAR_CREDS),
  scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  clientOptions: {
    subject: process.env.CALENDAR_EMAIL,
  },
});

export const calendar = google.calendar({ version: 'v3', auth });