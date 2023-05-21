// Potential New Controllers for Meetings
//
// Create New Event
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.CALENDAR_CREDS),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendar = google.calendar({ version: 'v3', auth });

// Should be passed into every request
const calendarId = '1ef27fb5c5f9399ead2e229f02b84fe8d17c2abda0fdecd3c32caa6c60a315e2@group.calendar.google.com';

export const createEvent = async (req, res) => {
  try {
    const event = await calendar.events.insert({
      calendarId,
      resource: {
        summary: '111111111',
        description: 'eventData.description',
        start: {
          dateTime: '2023-05-20T16:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2023-05-20T17:00:00Z',
          timeZone: 'America/New_York',
        },
      },
    });

    console.log('Event created:', event.data.summary);
    res.status(200).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).send(error);
  }
};

export const fetchEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;
    const event = await calendar.events.get({ calendarId, eventId });
    console.log('Event fetched:', event.data);
    res.status(200).send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const fetchCalendar = async (req, res) => {
  try {
    // const { calendarId } = req.params;
    const allEvents = await calendar.events.list({
      calendarId,
      maxResults: 10,
      singleEvents: true, // returns instances of recurring events, not the recurring event themselves, might need to be adapted
      orderBy: 'startTime',
    });

    console.log('Event fetched:', allEvents);
    res.status(200).send(allEvents);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

// create calendar

export const createCalendar = async (req, res) => {
  try {
    const { projectId } = req.params;
    // get calendar data from req.body
    const calendarData = {
      summary: `${projectId}-${math.random() * 10}`,
      description: 'A calendar for important events',
      timeZone: 'America/New_York',
    };

    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: calendarData.summary,
        description: calendarData.description,
        timeZone: calendarData.timeZone,
      },
    });

    console.log('Calendar created:', newCalendar.data.summary);
    res.status(200).send(newCalendar.data);
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(500).send('Error creating calendar');
  }
};
