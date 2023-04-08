import 'dotenv/config.js';
import db from '../../db/connection.js'
import Project from '../../models/project.js';
import { generateFakeUsers } from './utils/users.js'
import { generateProject, fillProjectWithUsers } from './utils/projects.js'


const reSeedDatabase = async () => {
  // Remove all data from database
  await db.dropDatabase();

  // Generate set of Users
  const designers = await generateFakeUsers(10, 'UX Designer')
  const engineers = await generateFakeUsers(15, 'Software Engineer')
  const users = [...designers, ...engineers]

  // Generate x number of Projects
  const projects = []
  const numOfProjects = 5
  for (let i = 0 ; i < numOfProjects ; i++) {
    projects.push(new Project(generateProject()))
  }

  // Fill a single project with users
  await fillProjectWithUsers(projects[0], designers.slice(0,2), engineers.slice(0,3))
  await projects.forEach(project => project.save())
  await users.forEach(user => user.save())
};

reSeedDatabase()
  .then(() => {
    setTimeout(() => db.close(), 2000);
  }
);
