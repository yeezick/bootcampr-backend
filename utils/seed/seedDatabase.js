import 'dotenv/config.js';
import db from '../../db/connection.js';
import Project from '../../models/project.js';
import User from '../../models/user.js';
import Ticket from '../../models/tickets.js';
import { generateFakeUser, generateFakeUsers } from './utils/users.js';
import { addCalendarToProject, generateProject, fillProjectWithUsers } from './utils/projects.js';
import axios from 'axios';
import { applePieData, dummyUserData, laterGatorData, sillyGooseData, starStruckData } from '../data/mocks/users.js';

const reSeedDatabase = async () => {
  console.log('Re-seeding database.');
  // Remove all data from database
  await db.dropDatabase();
  // TODO: remove or restrict access to this endpoint before deployment
  await axios.delete(`http://localhost:8001/calendar/deleteAllCalendars`);

  // Generate set of Users
  const designers = await generateFakeUsers(100, 'UX Designer');
  const engineers = await generateFakeUsers(150, 'Software Engineer');
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

  await addStaticSeedData(projects, users);

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

// Todo: move to a util file, project import currently fails script
export const addStaticSeedData = async (projects, users) => {
  const staticProject = new Project(await generateProject());

  const starStruck = new User(
    await generateFakeUser('UX Designer', starStruckData),
  );

  const boootcampr = new User(
    await generateFakeUser('UX Designer', dummyUserData),
  );

  const sillyGoose = new User(
    await generateFakeUser('Software Engineer', sillyGooseData),
  );

  const laterGator = new User(
    await generateFakeUser('Software Engineer', laterGatorData)
  );

  const applePie = new User(
    await generateFakeUser('Software Engineer', applePieData)
  )

  const noProjectUX = new User(
    await generateFakeUser('Software Engineer', {
      email: 'no@project.com',
      firstName: 'No',
      lastName: 'Project',
    }),
  );

  const sampleTicket = new Ticket({
    title: 'Sample title',
    description: 'Sample description',
    status: 'toDo',
    createdBy: boootcampr._id,
    projectId: staticProject._id,
  });
  sampleTicket.save();

  const sampleTaskBoard = {
    toDo: [sampleTicket._id],
    inProgress: [],
    underReview: [],
    completed: [],
  };

  const staticUX = [starStruck, boootcampr];
  const staticSWE = [sillyGoose, laterGator, applePie];

  await fillProjectWithUsers(staticProject, staticUX, staticSWE);

  staticProject.calendarId = await addCalendarToProject(staticProject._id);
  staticProject.projectTracker = sampleTaskBoard;

  projects.push(staticProject);
  users.push(...staticUX, ...staticSWE, noProjectUX);
};
