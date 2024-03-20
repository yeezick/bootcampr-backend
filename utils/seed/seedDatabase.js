import 'dotenv/config.js';
import db from '../../db/connection.js';
import Project from '../../models/project.js';
import User from '../../models/user.js';
import Ticket from '../../models/tickets.js';
import { createChatbot, generateFakeUser, generateFakeUsers } from './utils/users.js';
import { addCalendarToProject, generateProject, fillProjectWithUsers, addProjectEventsToCalendar } from '../helpers/projects.js';
import axios from 'axios';
import {
  applePieData,
  chatBotData,
  dummyUserData,
  laterGatorData,
  sillyGooseData,
  starStruckData,
  pollyProductData,
} from '../data/mocks/users.js';
import { generateProjectOrientation } from '../projectEvents.js';


const reSeedDatabase = async () => {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    console.log('Cannot re-seed production database');
    return;
  }

  console.log('Re-seeding database.');
  // Remove all data from database
  await db.dropDatabase();
  // TODO: remove or restrict access to this endpoint before deployment
  await axios.delete(`http://localhost:8001/calendar/deleteAllCalendars`);

  // Generate set of Users
  const designers = await generateFakeUsers(200, 'UX Designer');
  const engineers = await generateFakeUsers(250, 'Software Engineer');
  const productManagers = await generateFakeUsers(150, 'Product Manager');
  const users = [...designers, ...engineers, ...productManagers];

  // Generate x number of Projects
  const projects = [];
  const numOfProjects = 2; // set to only 2 to avoid hitting calendar quotas
  for (let i = 0; i < numOfProjects; i++) {
    projects.push(new Project(await generateProject()));
  }

  // Fill a single project with users
  await fillProjectWithUsers(projects[0], designers.slice(0, 2), engineers.slice(0, 3), productManagers.slice(0, 1));
  projects[0].calendarId = await addCalendarToProject(projects[0]._id);
  const projectId = projects[0]._id
  
  await addStaticSeedData(projects, users);

  //const projectId = projects[0]._id

  for (const project of projects) {
    await project.save();
  }
  for (const user of users) {
    await user.save();
  }

  //await generateProjectOrientation(projectId)
  
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
  const starStruck = new User(await generateFakeUser('UX Designer', starStruckData, staticProject._id));
  const dummyUser = new User(await generateFakeUser('UX Designer', dummyUserData, staticProject._id));
  const sillyGoose = new User(await generateFakeUser('Software Engineer', sillyGooseData, staticProject._id));
  const laterGator = new User(await generateFakeUser('Software Engineer', laterGatorData, staticProject._id));
  const applePie = new User(await generateFakeUser('Software Engineer', applePieData, staticProject._id));
  const pollyProduct = new User(await generateFakeUser('Product Manager', pollyProductData, staticProject._id));
  const noProjectUX = new User(
    await generateFakeUser('UX Designer', {
      email: 'no@project.com',
      firstName: 'No',
      lastName: 'Project',
    }),
  );

  const chatBot = new User(await createChatbot(chatBotData));

  const sampleTicket = new Ticket({
    title: 'Sample title',
    description: 'Sample description',
    status: 'toDo',
    createdBy: dummyUser._id,
    projectId: staticProject._id,
  });
  sampleTicket.save();

  const sampleTaskBoard = {
    toDo: [sampleTicket._id],
    inProgress: [],
    underReview: [],
    completed: [],
  };

  const staticUX = [starStruck, dummyUser];
  const staticSWE = [sillyGoose, laterGator, applePie];
  const staticPM = [pollyProduct];

  await fillProjectWithUsers(staticProject, staticUX, staticSWE, staticPM);

  staticProject.calendarId = await addCalendarToProject(staticProject._id);
  staticProject.projectTracker = sampleTaskBoard;

  projects.push(staticProject);

  users.push(...staticUX, ...staticSWE, noProjectUX, ...staticPM, chatBot);
};
