import dayjs from 'dayjs';
import User from '../../models/user.js'
import { produce } from 'immer';


/**
 * Returns the data relevant to enabling or disbaling a hangout link.
 * Should be spread out directly into the preparedEvent payload of a google calendar api call.
 * @param {Boolean} enableHangout Whether or not the event should have a hangout link.
 * @returns {Object} Containing the body to create or remove a hangout link.
 */
export const addConferenceDataToGoogleEvent = (projectId, eventSummary, enableHangout) => {
  if (enableHangout) {
    return {
      conferenceDataVersion: 1,
      resource: {
        conferenceData: {
          createRequest: {
            requestId: snakeCaseEventSummary(projectId, eventSummary),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      },
    };
  } else {
    return {
      conferenceDataVersion: 1,
      resource: { conferenceData: null },
    };
  }
};

/**
 * Translates raw google calendar events into objects that are consumable by FullCalendarJS
 * @param {ConvertedEvent[]} googleEvents
 * @returns Array of converted events
 */
export const convertGoogleEventsForCalendar = (googleEvents) => {
  if (!googleEvents) {
    return [];
  }

  const convertedEvents = [];
  for (const singleEvent of googleEvents) {
    const { attendees, creator, description, end, id, location, start, summary, ...metaData } = singleEvent;
    const currentEvent = {
      attendees: attendees || null,
      creator,
      description: description || null,
      // Todo: FullCalendar handles time conversions in an unusual way, saving them as UTC instead of as ISO acounting for TZ. This is a workaround.
      end: end.dateTime,
      eventId: id,
      googleDateFields: {
        endTime: end.dateTime,
        startTime: start.dateTime,
      },
      hangoutLink: singleEvent.hangoutLink ? singleEvent.hangoutLink : '',
      metaData,
      location,
      start: start.dateTime,
      timeZone: start.timeZone,
      title: summary,
    };

    convertedEvents.push(currentEvent);
  }
  return convertedEvents;
};

/**
 * Snake cases the project ID with the event's summary (should be unique)
 * @param {*} projectId
 * @param {*} eventSummary
 * @returns {String} Snake-cased event summary
 */
const snakeCaseEventSummary = (projectId, eventSummary) => {
  const snakeCasedEventSummary = eventSummary
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  return `${projectId}-${snakeCasedEventSummary}`;
};


export const generateProjectStartEvent = async (project) => {
  const { _id, timeline: { startDate }, calendarId, members: {engineers, designers, productManagers} } = project

  const start = dayjs(startDate).set('hour', 12).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss')
  const end = dayjs(startDate).set('hour', 13).set('minute', 0).set('second',0).format('YYYY-MM-DDTHH:mm:ss')

  const eventInfo = {
    title: 'Project Start',
    start,
    end,
    description: 'First day of project',
  }
    
      let preparedEvent = {
        calendarId: `${calendarId}@group.calendar.google.com`,
        resource: {},
        sendUpdates: 'all',
      };
  
        preparedEvent = produce(preparedEvent, (draft) => {
          draft = { ...draft, ...addConferenceDataToGoogleEvent(_id, eventInfo.title, true) };
          draft.resource = { ...eventInfo, ...draft.resource };
          return draft;
        });

       return preparedEvent
}
