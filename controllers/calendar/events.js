import { formatCalendarId } from '../../utils/helperFunctions.js';
import { calendar } from '../../server.js';
import { produce } from 'immer';
import { addConferenceDataToGoogleEvent, convertGoogleEventsForCalendar } from '../../utils/helpers/calendarHelpers.js';

export const createEvent = async (req, res) => {
  const { calendarId } = req.params;
  const { googleMeetingInfo, projectId, ...eventInfo } = req.body;

  try {
    let preparedEvent = {
      calendarId: `${calendarId}@group.calendar.google.com`,
      resource: {},
      sendUpdates: 'all',
    };

    if (googleMeetingInfo.enabled) {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft = { ...draft, ...addConferenceDataToGoogleEvent(projectId, eventInfo.summary, true) };
        draft.resource = { ...eventInfo, ...draft.resource };
        return draft;
      });
    } else {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft.resource = eventInfo;
      });
    }

    const { data: googleEvent } = await calendar.events.insert(preparedEvent);
    const convertedEvent = convertGoogleEventsForCalendar([googleEvent]);
    res.status(200).send(convertedEvent[0]);
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
      sendUpdates: 'all',
    };

    if (googleMeetingInfo.enabled) {
      if (!googleMeetingInfo.hangoutLink) {
        preparedEvent = produce(preparedEvent, (draft) => {
          draft = { ...draft, ...addConferenceDataToGoogleEvent(projectId, eventInfo.summary, true) };
          draft.resource = { ...eventInfo, ...draft.resource };
          return draft;
        });
      } else {
        preparedEvent = produce(preparedEvent, (draft) => {
          draft.resource = eventInfo;
        });
      }
    } else {
      preparedEvent = produce(preparedEvent, (draft) => {
        draft = { ...draft, ...addConferenceDataToGoogleEvent(projectId, eventInfo.summary, false) };
        draft.resource = { ...eventInfo, ...draft.resource };
        return draft;
      });
    }

    const { data: googleEvent } = await calendar.events.update(preparedEvent);
    const convertedEvent = convertGoogleEventsForCalendar([googleEvent]);
    res.status(200).send(convertedEvent[0]);
  } catch (error) {
    console.error(`Error creating event for calendar (${calendarId})`, error);
    res.status(400).send(error);
  }
};

export const fetchEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;
    const { data: googleEvent } = await calendar.events.get({
      calendarId: formatCalendarId(calendarId),
      eventId,
    });
    const convertedEvent = convertGoogleEventsForCalendar([googleEvent]);
    res.status(200).send(convertedEvent[0]);
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

// console.log('\n preparedEvent \n', preparedEvent);

// console.log(
//   '\n attendees \n',
//   preparedEvent.resource.attendees,
//   '\n createRequest\n ',
//   // preparedEvent.resource.conferenceData.createRequest,
// );
