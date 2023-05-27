import 'dotenv/config.js';
import db from '../../db/connection.js';
import Project from '../../models/project.js';
import { generateFakeUsers } from './utils/users.js';
import { addCalendarToProject, generateProject, fillProjectWithUsers } from './utils/projects.js';
import axios from 'axios';

const reSeedDatabase = async () => {
  // Remove all data from database
  await db.dropDatabase();
  await axios.get(`http://localhost:8001/calendar/deleteAll`);

  // Generate set of Users
  const designers = await generateFakeUsers(10, 'UX Designer');
  const engineers = await generateFakeUsers(15, 'Software Engineer');
  const users = [...designers, ...engineers];

  // Generate x number of Projects
  const projects = [];
  const numOfProjects = 2;
  for (let i = 0; i < numOfProjects; i++) {
    projects.push(new Project(generateProject()));
  }
  console.log('all projects', projects);

  // Fill a single project with users
  await fillProjectWithUsers(projects[0], designers.slice(0, 2), engineers.slice(0, 3));
  await projects.forEach(async (project) => {
    const newCalendarId = await addCalendarToProject(project._id);
    console.log('newCalendar', newCalendarId);
    project.calendarId = newCalendarId;
    console.log('projectWithID', project);
    project.save();
  });
  await users.forEach((user) => user.save());
};

reSeedDatabase();
