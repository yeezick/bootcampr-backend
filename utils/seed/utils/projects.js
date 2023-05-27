import { defaultProject } from '../../data/mocks/projects.js';
import { getIds } from './users.js';
import axios from 'axios';
/**
 * Generate Project
 * @param {Object} project custom options including: title, goal, problem, startDate and duration
 * @returns
 */
export const generateProject = async (project = defaultProject) => {
  const { title, goal, problem, startDate, duration } = project;
  // TODO: adjust start and end date format and calulcations as needed
  const endDate = Date.now() + duration * 24 * 60 * 60 * 60;

  return {
    chats: [],
    goal,
    meetings: [],
    members: {
      engineers: [],
      designers: [],
    },
    problem,
    tasks: [],
    timeline: {
      startDate,
      endDate,
    },
    title,
  };
};

/**
 * Fill a project with users
 * @param {Object} project object
 * @param {Array} designers array of User objects
 * @param {Array} engineers array of User objects
 */
export const fillProjectWithUsers = async (project, designers, engineers) => {
  project.members.engineers = getIds(engineers);
  project.members.designers = getIds(designers);
  const users = [...designers, ...engineers];
  users.forEach(async (user) => {
    user.project = project._id;
  });
};

/**
 * Create a calendar instance for this project
 * @param {string} projectId The Id of the newly created project
 * @returns {string | null} Returns either the Id of the newly created calendar or null if unsuccessful.
 */
export const addCalendarToProject = async (projectId) => {
  try {
    const response = await axios.post(`http://localhost:8001/calendar/createCalendar/${projectId}`, {
      summary: `Main calendar for ${projectId}`,
      description: `Team calendar for ${projectId}`,
      timeZone: 'America/New_York', // set to universal tz
    });
    return response.data.id.split('@')[0];
  } catch (error) {
    console.log('Error creating a project for this team', error);
    return null;
  }
};
