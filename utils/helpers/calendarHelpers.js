import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
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

export const findAvailableDateTime = (commonAvailability, project, ref) => {
  let availableDOTW;

  if(ref === "first"){
    availableDOTW = Object.keys(commonAvailability)[0]
  } else if (ref === "last") {
    availableDOTW = Object.keys(commonAvailability)[Object.keys(commonAvailability).length - 1]
  }
 
  const availableTime = dayjs(commonAvailability[availableDOTW][0][0], "h:mm A").format('HH:mm:ss')

  let DOTWNumber;
  switch(availableDOTW){
    case "SUN":
      DOTWNumber = 0
      break;
    case "MON":
      DOTWNumber = 1
      break;
    case "TUE":
      DOTWNumber = 2
      break;
    case "WED":
      DOTWNumber = 3
      break;
    case "THU":
      DOTWNumber = 4
      break;
    case "FRI":
      DOTWNumber = 5
      break;
    case "SAT":
      DOTWNumber = 6
      break;
  }

   const start = dayjs(`${ref === 'first' ? project.timeline.startDate : project.timeline.endDate} ${availableTime}`).day(DOTWNumber).format('YYYY-MM-DDTHH:mm:ss')
   const end = dayjs(start).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss')

   return {
    start,
    end
   }
}

