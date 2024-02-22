import { defaultProject } from '../data/mocks/projects.js';
import { getIds } from '../seed/utils/users.js';
import axios from 'axios';
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'


  // TODO: Uncomment commented-out product manager code when frontend is set up to handle product managers

/**
 * Generate Project
 * @param {Object} project custom options including: title, goal, problem, startDate and duration
 * @returns
 */
export const generateProject = async (project = defaultProject) => {
  const { title, goal, problem, duration } = project;

  dayjs.extend(weekday);
  dayjs.extend(relativeTime);

  // All projects will start on upcoming Sunday (7)
  const upcomingSundayRaw = dayjs().weekday(7);
  const formattedStartDate = upcomingSundayRaw.format('YYYY/MM/DD');

  const endDateRaw = upcomingSundayRaw.add(duration, 'd');
  const formattedEndDate = endDateRaw.format('YYYY/MM/DD');


  return {
    calendarId: '',
    chats: [],
    goal,
    meetings: [],
    members: {
      engineers: [],
      designers: [],
      productManagers: [],
    },
    problem,
    tasks: [],
    timeline: {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    },
    title,
  };
};

/**
 * Fill a project with users
 * @param {Object} project object
 * @param {Array} designers array of User objects
 * @param {Array} engineers array of User objects
 * @param {Array} productManagers array of User objects
 */
export const fillProjectWithUsers = async (project, designers, engineers, productManagers) => {
  project.members.engineers = getIds(engineers);
  project.members.designers = getIds(designers);
  // TODO: Uncomment when frontend is set up to handle product managers
  // project.members.productManagers = getIds(productManagers);

  const users = [
    ...designers, 
    ...engineers, 
    // TODO: Uncomment when frontend is set up to handle product managers
    // ...productManagers
  ];

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
    console.error('Error creating a project for this team', error);
    return null;
  }
};
