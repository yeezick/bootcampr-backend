import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import Project from '../models/project.js';
import User from '../models/user.js';
import { generateRandomSingleDayAvailability } from './availability.js'
import { generateFakeUsers, generateProject } from './seedDataHelpers.js';
import { projectThemes } from './mocks/projects.js';

const reSeedDatabase = async () => {
  // reset database
  // await db.dropDatabase();

  // Create 5 Projects of the same Type
  // Default startDate is today (Date....)
  // Default duration is 4 weeks aka 28 days
  const projects = []

  // Redesign this lofic?
  for (let i=0 ; i < 5; i++) {
    projects.push(generateProject({
      ...projectThemes.travel, 
      startDate: Date.now(), 
      duration: 28
    }))
  }
  // Save Projects to DB

  // Generate set of users
  const designers = await generateFakeUsers(10, 'UX Designer')
  const engineers = await generateFakeUsers(15, 'Software Engineer')
  const users = [...designers, ...engineers]

  // Assign Users to Projects
  for (let u = 0; u < users.length ; u++) {
    const user = users[u]
    const userRole = user.role === 'Software Engineer' ? 'engineers' : 'designers'
    const index = u % projects.length
    projects[index].members[userRole].push(user._id)
  }

  // Plan out Availability Logic for Teams

  // Save users to database
  // await users.forEach((user) => user.save());

  // save/insert projects in database
  // await Project.insertMany(projects);

  // Get All Projects + Users From Database
  // let allProjects = await Project.find();
  // let allUsers = await User.find();

  // save users with newly populated project arrays
  // await allUsers.forEach(async (user) => await user.save());
};

reSeedDatabase()
// .then(() => {
//   setTimeout(() => db.close(), 2000);
// });
