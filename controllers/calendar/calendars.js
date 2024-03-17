import { calendar } from '../../server.js';
import { formatCalendarId } from '../../utils/helperFunctions.js';
import Project from '../../models/project.js';
import { convertGoogleEventsForCalendar } from '../../utils/helpers/calendarHelpers.js';
import { generateDayJs } from '../../globals.js';
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

    const convertedEvents = convertGoogleEventsForCalendar(allEvents.data);
    res.status(200).send(convertedEvents);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const fetchUserCalendar = async (req, res) => {
  try {
    const { calendarId, userEmail } = req.params;

    const allEvents = await calendar.events.list({
      calendarId: formatCalendarId(calendarId),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const userEvents = allEvents.data.items.filter((event) => {
      if (event.attendees) {
        for (const attendee of event.attendees) {
          if (attendee.email === userEmail) {
            return event;
          }
        }
      }
    });
    const convertedUserEvents = convertGoogleEventsForCalendar(userEvents);
    res.status(200).send(convertedUserEvents);
  } catch (error) {
    const { calendarId } = req.params;
    if (calendarId === 'sandbox') {
      console.log;
      res.status(200).send(generateSandboxEvents());
    } else {
      console.error('Error fetching event:', error);
      res.status(400).send(error);
    }
  }
};

const generateSandboxEvents = () => {
  const events = [];

  const sandboxAttendees = [
    { email: 'star@struck.com', responseStatus: 'needsAction', comment: 'organizer' },
    { email: 'silly@goose.com', responseStatus: 'needsAction' },
    { email: 'svc.jira.swe@gmail.com', responseStatus: 'needsAction' },
    { email: 'later@gator.com', responseStatus: 'needsAction' },
    { email: 'apple@pie.com', responseStatus: 'needsAction' },
    { email: 'polly@product.com', responseStatus: 'needsAction' },
  ];

  // start date should be project start date
  // end date should be project end date
  const startDate = generateDayJs().add(1, 'day').format();
  const endDate = generateDayJs(startDate).add(3, 'week').format();
  const currentEvent = {
    attendees: sandboxAttendees,
    // creator,
    description: 'Sample event',
    daysOfWeek: [1, 2, 3, 4, 5],
    // Todo: FullCalendar handles time conversions in an unusual way, saving them as UTC instead of as ISO acounting for TZ. This is a workaround.
    startRecur: startDate,
    endRecur: endDate,
    endTime: '08:30',
    startTime: '08:00',
    eventId: 'sampleEvent',
    googleDateFields: {
      endTime: endDate,
      startTime: startDate,
    },
    hangoutLink: 'https://meet.google.com/',
    title: 'Sample event',
  };
  console.log('currentEvent', currentEvent);
  return [currentEvent];
};

// This does NOT return the events for each calendar.
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
// TODO: remove or restrict access to this endpoint before deployment
export const deleteAllCalendars = async (req, res) => {
  try {
    const response = await calendar.calendarList.list();
    const calendars = response.data.items;
    const ignoreCalendars = [
      'en.usa#holiday@group.v.calendar.google.com',
      'addressbook#contacts@group.v.calendar.google.com',
      process.env.CALENDAR_EMAIL,
    ];
    for (const currCalendar of calendars) {
      if (!ignoreCalendars.includes(currCalendar.id)) {
        await calendar.calendarList.delete({ calendarId: currCalendar.id });
        console.log(`Deleted calendar with ID: ${currCalendar.id}`);
      }
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
