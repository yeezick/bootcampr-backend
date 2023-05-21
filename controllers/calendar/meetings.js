// Potential New Controllers for Meetings
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

import { google } from 'googleapis';
import { formatCalendarId } from '../../utils/helperFunctions.js';

/** So far I've learned that there are usage limits to this API.
 * One being that only 60 calendars can be created within an hour
 * Afterward, every request results in an exponential backoff rate
 * */
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.CALENDAR_CREDS),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendar = google.calendar({ version: 'v3', auth });

export const createEvent = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const event = await calendar.events.insert({
      calendarId: formatCalendarId(calendarId),
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

    console.log('Event created:', event.data);
    res.status(200).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).send(error);
  }
};

export const fetchEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;
    const event = await calendar.events.get({
      calendarid: formatCalendarId(calendarId),
      eventId,
    });
    console.log('Event fetched:', event.data);
    res.status(200).send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const fetchCalendar = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const allEvents = await calendar.events.list({
      calendarId: formatCalendarId(calendarId),
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

/**
 * Used to create a calendar for a new project.
 * @param {:param} projectId solely used to add the projectId to the summary
 * @body {summary: string, description: string, timeZone: 'America/New_York'}
 */
export const createCalendar = async (req, res) => {
  try {
    const { projectId } = req.params;
    // get calendar data from req.body
    const calendarData = {
      summary: `Main calendar for ${projectId}`,
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

    console.log('Calendar created:', newCalendar.data);
    res.status(200).send(newCalendar.data);
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(400).send('Error creating calendar');
  }
};

/**
 * Used to delete all calendars when re-seeding DB
 */
export const deleteAllCalendars = async (req, res) => {
  try {
    const response = await calendar.calendarList.list();
    const calendars = response.data.items;

    for (const calendarCurr of calendars) {
      await calendar.calendarList.delete({ calendarId: calendarCurr.id });
      console.log(`Deleted calendar with ID: ${calendarCurr.id}`);
    }

    return res.status(200).send('All calendars deleted');
  } catch (error) {
    console.error('Error deleting calendars:', error);
    return res.status(400).send('Error deleting all calendars', error);
  }
};
