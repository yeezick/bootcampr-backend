import { formatCalendarId } from '../../utils/helperFunctions.js';
import { calendar } from '../../server.js';
import { produce } from 'immer';

// Potential New Controllers for Meetings
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

export const createEvent = async (req, res) => {
  const { calendarId } = req.params;
  const { enabledGoogleMeet, ...eventInfo } = req.body;

  try {
    let preparedEvent = {
      calendarId: `${calendarId}@group.calendar.google.com`,
      resource: {},
      sendUpdates: 'all',
    };

    if (enabledGoogleMeet) {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft.conferenceDataVersion = 1;
        draft.resource = eventInfo;
        draft.resource.conferenceData = {
          createRequest: {
            requestId: 'reqid',
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      });
    } else {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft.resource = eventInfo;
      });
    }

    const event = await calendar.events.insert(preparedEvent);
    res.status(200).send(event);
  } catch (error) {
    console.error(`Error creating event for calendar (${calendarId})`, error);
    res.status(400).send(error);
  }
};

export const updateEvent = async (req, res) => {
  const { calendarId, eventId } = req.params;

  try {
    const preparedEvent = {
      calendarId: `${calendarId}@group.calendar.google.com`,
      eventId,
      resource: req.body,
      sendUpdates: 'all',
    };

    const event = await calendar.events.update(preparedEvent);
    res.status(200).send(event);
  } catch (error) {
    console.error(`Error creating event for calendar (${calendarId})`, error);
    res.status(400).send(error);
  }
};

export const fetchEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;
    const event = await calendar.events.get({
      calendarId: formatCalendarId(calendarId),
      eventId,
    });
    res.status(200).send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

export const deleteCalendarEvents = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const formattedCalendarId = formatCalendarId(calendarId);
    const {
      data: { items: events },
    } = await calendar.events.list({
      calendarId: formattedCalendarId,
      singleEvents: true,
      fields: 'items(id)',
    });

    for (const event of events) {
      await calendar.events.delete({
        calendarId: formattedCalendarId,
        eventId: event.id,
      });
      console.log('Deleting calendar:', calendarId);
    }

    res.status(200).send('All events deleted');
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(400).send(error);
  }
};

/*
const sampleNewEvent = {
    "calendarId": "{{CALENDAR_ID}}@group.calendar.google.com",
    "resource": {
        "description": "description",
        "summary": "1",
        "start": {
            "dateTime": "2023-05-29T16:00:00Z",
            "timeZone": "America/New_York"
        },
        "end": {
            "dateTime": "2023-05-29T17:00:00Z",
            "timeZone": "America/New_York"
        },
        "attendees": [
            {
                "email": "{{USER_EMAIL}}@gmail.com"
            }
        ]
    },
    "sendUpdates": "all"
};
*/
