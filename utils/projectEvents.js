import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
import Project from '../models/project.js';
import { calendar } from '../server.js';
import { findCommonAvailability } from './availability.js';
import { findAvailableDateTime } from './helpers/calendarHelpers.js';
import { convertGoogleEventsForCalendar } from './helpers/calendarHelpers.js';

export const createGoogleEvent = async (eventInfo) => {
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
  
  return createGoogleEvent(eventInfo)
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

  return createGoogleEvent(eventInfo)
}


export const generateProjectSubmissionMeeting = async(projectId) => {
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
  const lastDateAndTime = findAvailableDateTime(commonAvailability, project, "last")

  const eventInfo = {
    summary: 'Project Submission',
    start: {
      dateTime: lastDateAndTime.start,
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: lastDateAndTime.end,
      timeZone: 'America/New_York'
    },
    description: 'Project Submission Meeting',
    attendees,
    calendarId: project.calendarId
  }

  return createGoogleEvent(eventInfo)
}

