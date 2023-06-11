import 'dotenv/config.js';
import db from '../../db/connection.js';
import Project from '../../models/project.js';
import { generateFakeUsers } from './utils/users.js';
import { addCalendarToProject, generateProject, fillProjectWithUsers } from './utils/projects.js';
import axios from 'axios';

const reSeedDatabase = async () => {
  // Remove all data from database
  await db.dropDatabase();
  await axios.delete(`http://localhost:8001/calendar/deleteAllCalendars`);

  // Generate set of Users
  const designers = await generateFakeUsers(10, 'UX Designer');
  const engineers = await generateFakeUsers(15, 'Software Engineer');
  const users = [...designers, ...engineers];

  // Generate x number of Projects
  const projects = [];
  const numOfProjects = 2; // set to only 2 to avoid hitting calendar quotas
  for (let i = 0; i < numOfProjects; i++) {
    projects.push(new Project(await generateProject()));
  }

  // Fill a single project with users
  await fillProjectWithUsers(projects[0], designers.slice(0, 2), engineers.slice(0, 3));
  projects[0].calendarId = await addCalendarToProject(projects[0]._id);

  for (const project of projects) {
    await project.save();
  }

  for (const user of users) {
    await user.save();
  }
  return;
};

reSeedDatabase()
  .then(() => {
    db.close();
  })
  .catch((error) => {
    console.log('Error reseeding DB', error);
    db.close();
  });
