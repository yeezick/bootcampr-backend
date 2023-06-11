import { calendar } from '../../server.js';
import { formatCalendarId } from '../../utils/helperFunctions.js';

/**
 * There are usage limits to this API. (https://developers.google.com/calendar/api/guides/quota)
 * Ex: only 60 calendars can be created within an hour
 * */

export const fetchCalendar = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const allEvents = await calendar.events.list({
      calendarId: formatCalendarId(calendarId),
      singleEvents: true, // returns instances of recurring events, not the recurring event themselves, might need to be adapted
      orderBy: 'startTime',
    });

    res.status(200).send(allEvents);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const fetchAllCalendars = async (req, res) => {
  try {
    const allEvents = await calendar.calendarList.list();

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
    const calendarData = {
      summary: `Main calendar for ${projectId}`,
      description: `Team calendar for ${projectId}`,
      timeZone: 'America/New_York', // set to universal tz
    };

    const newCalendar = await calendar.calendars.insert({
      requestBody: calendarData,
    });

    // Set ACLs to grant access to invitees
    const rule = {
      role: 'reader',
      scope: {
        type: 'user', // Can be 'user', 'group', 'domain', etc. depending on the type of scope
        value: 'bootcamprcalendar@gmail.com', // Specify the email address of the invitee
      },
    };

    // Should map through all the members of a project
    await calendar.acl.insert({
      calendarId: newCalendar.data.id,
      resource: rule,
    });

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

    res.status(200).send('All calendars deleted');
  } catch (error) {
    console.error('Error deleting calendars:', error);
    res.status(400).send('Error deleting all calendars', error);
  }
};

// WIP
export const addMemberToCalendar = async (req, res) => {
  try {
    const { calendarId, userEmail } = req.params;
    const rule = {
      role: 'none',
      scope: {
        type: 'user',
        value: userEmail,
      },
    };

    await calendar.acl.insert({
      calendarId: formatCalendarId(calendarId),
      resource: rule,
    });

    res.status(200).send(`Success adding ${userEmail} to calendar: ${calendarId}`);
  } catch (error) {
    console.error('Error adding user to calendar:', error);
    res.status(400).send('Error adding user to calendar.');
  }
};
