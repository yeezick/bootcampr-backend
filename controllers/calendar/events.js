import { formatCalendarId } from '../../utils/helperFunctions.js';
import { calendar } from '../../server.js';
import { produce } from 'immer';

// Potential New Controllers for Meetings
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

export const snakeCaseEventSummary = (projectId, eventSummary) => {
  const snakeCasedEventSummary = eventSummary
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  return `${projectId}-${snakeCasedEventSummary}`;
};
export const createEvent = async (req, res) => {
  const { calendarId } = req.params;
  const { googleMeetingInfo, projectId, ...eventInfo } = req.body;

  try {
    let preparedEvent = {
      calendarId: `${calendarId}@group.calendar.google.com`,
      resource: {},
      sendUpdates: 'all',
    };

    if (googleMeetingInfo.enabledGoogleMeet) {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft.conferenceDataVersion = 1;
        draft.resource = eventInfo;
        draft.resource.conferenceData = {
          createRequest: {
            requestId: buildRequestId(projectId, eventInfo.summary),
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
  const { googleMeetingInfo, projectId, ...eventInfo } = req.body;

  try {
    let preparedEvent = {
      calendarId: `${calendarId}@group.calendar.google.com`,
      eventId,
      // resource: req.body,
      sendUpdates: 'all',
    };

    // if google meet is enabled
    // does hangout link exist? do nothing
    //hangout link doesn't exist? create event
    // else
    // does hangout link exist? delete meet

    // if google meet is enabled, check if there is an existing hagout link

    if (googleMeetingInfo.enabledGoogleMeet) {
      // if there is no hangout link, create one
      if (!googleMeetingInfo.hangoutLink) {
        preparedEvent = produce(preparedEvent, (draft) => {
          draft.conferenceDataVersion = 1;
          draft.resource = eventInfo;
          draft.resource.conferenceData = {
            createRequest: {
              requestId: buildRequestId(projectId, eventInfo.summary),
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          };
        });
      } else {
        // if google meet is disabled, remove it from the event
        console.log('hit');
        preparedEvent = produce(preparedEvent, (draft) => {
          draft.conferenceDataVersion = 0;

          draft.resource = eventInfo;
          draft.resource.conferenceData = null;
          draft.conferenceData = null;
        });
      }
    } else if (!googleMeetingInfo.enabledGoogleMeet && googleMeetingInfo.hangoutLink) {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft.conferenceDataVersion = 0;

        draft.resource = eventInfo;
        draft.resource.conferenceData = null;
        draft.conferenceData = null;
      });
    }
    console.log('reqbody \n', req.body);
    console.log('preparedEvent \n', preparedEvent);
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
