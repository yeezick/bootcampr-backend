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
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const fetchSandboxCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    res.status(200).send(generateSandboxEvents(startDate, endDate));
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

const generateSandboxEvents = (startDate, endDate) => {
  const designers = [
    { email: 'star@struck.com', responseStatus: 'needsAction', comment: 'organizer' },
    { email: 'silly@goose.com', responseStatus: 'needsAction' },
  ];
  const engineers = [
    { email: 'later@gator.com', responseStatus: 'needsAction', comment: 'organizer' },
    { email: 'apple@pie.com', responseStatus: 'needsAction' },
    { email: 'svc.jira.swe@gmail.com', responseStatus: 'needsAction' },
  ];
  const wholeTeam = [
    { email: 'polly@product.com', responseStatus: 'needsAction', comment: 'organizer' },
    { email: 'later@gator.com', responseStatus: 'needsAction' },
    { email: 'apple@pie.com', responseStatus: 'needsAction' },
    { email: 'svc.jira.swe@gmail.com', responseStatus: 'needsAction' },
    { email: 'star@struck.com', responseStatus: 'needsAction' },
    { email: 'silly@goose.com', responseStatus: 'needsAction' },
  ];

  const standupFields = {
    backgroundColor: '#ecedf8',
    borderColor: '#1a237e',
    daysOfWeek: [1, 2, 3, 4, 5],
    description: 'Discuss progress and blockers.',
    startRecur: generateDayJs(startDate).format(),
    endRecur: generateDayJs(endDate).format(),
    googleDateFields: {
      endTime: endDate,
      startTime: startDate,
    },
    hangoutLink: 'https://meet.google.com/',
  };

  const uxdStandup = {
    attendees: designers,
    creator: 'starStruck',
    endTime: '08:30',
    startTime: '08:00',
    eventId: 'uxdStandup',
    title: 'UXD daily stand-up ',
    ...standupFields,
  };

  const sweStandUp = {
    attendees: engineers,
    creator: 'laterGator',
    endTime: '09:30',
    startTime: '09:00',
    eventId: 'sweStandup',
    title: 'SWE daily stand-up ',
    ...standupFields,
  };

  const allTeamStandup = {
    attendees: wholeTeam,
    creator: 'pollyProduct',
    endTime: '10:30',
    startTime: '10:00',
    eventId: 'allTeamStandup',
    title: 'All-team meeting',
    ...standupFields,
  };

  const sandboxEvents = [uxdStandup, sweStandUp, allTeamStandup];
  console.log('sandboxevents', sandboxEvents);
  return sandboxEvents;
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
