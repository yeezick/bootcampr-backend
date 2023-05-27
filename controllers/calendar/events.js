// Potential New Controllers for Meetings
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

import { formatCalendarId } from '../../utils/helperFunctions.js';
import { auth, calendar } from '../../server.js';

/**
 * There are usage limits to this API. (https://developers.google.com/calendar/api/guides/quota)
 * Ex: only 60 calendars can be created within an hour
 * */

// Todo: update to use information sent by frontend instead of hardcoded obj
export const createEvent = async (req, res) => {
  try {
    const { calendarId } = req.params;
    // destructured from body
    const eventData = {
      calendarId: formatCalendarId(calendarId),
      resource: {
        summary: '111111111',
        description: 'eventData.description',
        start: {
          dateTime: '2023-05-27T16:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2023-05-27T17:00:00Z',
          timeZone: 'America/New_York',
        },
      },
    };
    const event = await calendar.events.insert(eventData);

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
    res.status(200).send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};
