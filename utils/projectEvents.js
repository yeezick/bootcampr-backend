import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
import Project from '../models/project.js';
import { calendar } from '../server.js';
import { findCommonAvailability } from './availability.js';
import { findFirstAvailableDateTime } from './helpers/calendarHelpers.js';

const createGoogleEvent = async (eventInfo) => {
  let preparedEvent = {
    calendarId: `${eventInfo.calendarId}@group.calendar.google.com`,
    resource: eventInfo,
    sendUpdates: 'all',
  };

  const { data: googleEvent } = await calendar.events.insert(preparedEvent);
  const convertedEvent = convertGoogleEventsForCalendar([googleEvent]);
  return convertedEvent
}

export const generateProjectOrientation = async (projectId) => {
  const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }])
      .exec();

  const members = [...project.members.engineers, ...project.members.designers]
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
  
  return createGoogleEvent(eventInfo)
}


export const generateProjectKickoffMeeting = async (projectId) => {
  const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }])
      .exec();

  const members = [...project.members.engineers, ...project.members.designers]
  const attendees = members.map((member) => {
    return {
      email: member.email,
      comment: 'not organizer'
    }
  })
  const commonAvailability = findCommonAvailability(members)
  const firstDateAndTime = findFirstAvailableDateTime(commonAvailability, project)

  const eventInfo = {
    summary: 'Kickoff Meeting',
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

  return createGoogleEvent(eventInfo)
}

