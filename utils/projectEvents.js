import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
import Project from '../models/project.js';
import { calendar } from '../googleCalendar.js';
import { findCommonAvailability } from './availability.js';
import { findAvailableDateTime } from './helpers/calendarHelpers.js';
import { convertGoogleEventsForCalendar } from './helpers/calendarHelpers.js';
import axios from 'axios';

export const createGoogleEvent = async (eventInfo) => {
  let preparedEvent = {
    calendarId: `${eventInfo.calendarId}@group.calendar.google.com`,
    resource: eventInfo,
    sendUpdates: 'all',
  };

  const { data: googleEvent } = await calendar.events.insert(preparedEvent);
  console.log(googleEvent)
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
    googleMeetingInfo: {
      enabled: true,
      hangoutLink: false
    },
    attendees,
    calendarId: project.calendarId,
    projectId
  }
  
  try {
    const response = await axios.post(`http://localhost:8001/calendar/${project.calendarId}/generate-project-orientation`, eventInfo);
    return response.data;
  } catch (error) {
    console.error('Error creating project orientation', error);
    return null;
  }
  
}


export const generateProjectKickoffMeeting = async (projectId) => {
  const project = await Project.findById(projectId)
      .populate([{ path: 'members.engineers' }, { path: 'members.designers' }, { path: 'members.productManagers' }])
      .exec();
console.log(project)
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

