import { formatCalendarId } from '../../utils/helperFunctions.js';
import { calendar } from '../../googleCalendar.js';
import { produce } from 'immer';
import { addConferenceDataToGoogleEvent, convertGoogleEventsForCalendar } from '../../utils/helpers/calendarHelpers.js';
import { generateProjectKickoffMeeting, generateProjectOrientation, generateProjectSubmissionMeeting } from '../../utils/projectEvents.js';

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

export const deleteEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;

    const deletedEvent = await calendar.events.delete({
      calendarId: formatCalendarId(calendarId),
      eventId,
    });
  
    res.status(200).send('Event deleted.');
  } catch (error) {
    console.log('Error deleting event:', error);
    res.status(400).send(error);
  }
};

export const createProjectEvents = async (req, res) => {
  const { projectId } = req.params
  try {
    const projectKickoff = await generateProjectKickoffMeeting(projectId)
    const projectOrientation = await generateProjectOrientation(projectId)
    const projectSubmission = await generateProjectSubmissionMeeting(projectId)

    res.status(200).send({projectKickoff, projectOrientation, projectSubmission})
  } catch(error) {
    console.log('Error creating project events:', error)
    res.status(400).send(error)
  }
}