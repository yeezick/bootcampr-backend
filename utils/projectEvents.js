import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
import Project from '../models/project.js';
import { produce } from 'immer';
import { calendar } from '../googleCalendar.js';
import { findCommonAvailability } from './availability.js';
import { findAvailableDateTime } from './helpers/calendarHelpers.js';
import { convertGoogleEventsForCalendar, addConferenceDataToGoogleEvent } from './helpers/calendarHelpers.js';


export const createGoogleEvent = async (eventInfo, projectId) => {
  let preparedEvent = {
    calendarId: `${eventInfo.calendarId}@group.calendar.google.com`,
    resource: eventInfo,
    sendUpdates: 'all',
  };

  preparedEvent = produce(preparedEvent, (draft) => {
    draft = { ...draft, ...addConferenceDataToGoogleEvent(projectId, eventInfo.summary, true) };
    draft.resource = { ...eventInfo, ...draft.resource };
    return draft;
  });

  const { data: googleEvent } = await calendar.events.insert(preparedEvent);
  const convertedEvent = convertGoogleEventsForCalendar([googleEvent]);
  return convertedEvent
}

export const generateProjectOrientation = async (projectId) => {
  const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }, { path: 'members.productManagers' }])
      .exec();

  const members = [...project.members.engineers, ...project.members.designers, ...project.members.productManagers]
  const attendees = members.map((member) => {
    return {
      email: member.email,
      comment: 'not organizer'
    }
  })

  const start = dayjs(project.timeline.startDate).set('hour', 12).set('minute', 0).set('second', 0).format('YYYY-MM-DDTHH:mm:ss')
  const end = dayjs(project.timeline.startDate).set('hour', 13).set('minute', 0).set('second',0).format('YYYY-MM-DDTHH:mm:ss')

  const eventInfo = {
    summary: 'Orientation',
    start: {
      dateTime: start,
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: end,
      timeZone: 'America/New_York'
    },
    description: 'Project Orientation',
    attendees,
    calendarId: project.calendarId
  }
  
  return createGoogleEvent(eventInfo, projectId)
}


export const generateProjectKickoffMeeting = async (projectId) => {
  const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }, { path: 'members.productManagers' }])
      .exec();

  const members = [...project.members.engineers, ...project.members.designers, ...project.members.productManagers]
  const attendees = members.map((member) => {
    return {
      email: member.email,
      comment: 'not organizer'
    }
  })
  const commonAvailability = findCommonAvailability(members)
  const firstDateAndTime = findAvailableDateTime(commonAvailability, project, "first")

  const eventInfo = {
    summary: 'Kickoff',
    start: {
      dateTime: firstDateAndTime.start,
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: firstDateAndTime.end,
      timeZone: 'America/New_York'
    },
    description: 'Project Kickoff Meeting',
    attendees,
    calendarId: project.calendarId
  }

  return createGoogleEvent(eventInfo, projectId)
}

