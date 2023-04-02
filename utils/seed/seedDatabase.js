import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../../db/connection.js'
import Project from '../../models/project.js';
import User from '../../models/user.js';
import { generateRandomSingleDayAvailability } from '../availability.js'
import { generateFakeUsers } from './utils/users.js'
import { projectThemes } from '../data/mocks/projects.js';
import { generateProject } from './utils/projects.js'

const reSeedDatabase = async () => {
  // Reset Database
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


    /**
   * 
   * @param {Array} users object
   * @returns Array of User ObjectIds
   */
  const getIds = (users) => {
    const ids = users.map(user => user._id)
    return ids
  }

  /**
   * Fill a project with users
   * @param {Object} project object 
   * @param {Array} designers array of User objects
   * @param {Array} engineers array of User objects
   */
  const fillProjectWithUsers = async (project, designers, engineers) => {
    console.log(designers)
    console.log(project)
    project.members.engineers = getIds(engineers)
    project.members.designers = getIds(designers)
    const users = [...designers, ...engineers]
    users.forEach((user) => {
      console.log(user)
      user.project = project._id})
  }



  await fillProjectWithUsers(projects[0], getIds(designers.slice(0,2)), getIds(engineers.slice(0,3)))
  await projects.forEach(project => project.save())
  await users.forEach(user => user.save())
  // console.log(users)




//   // save/insert projects in database
//   // await Project.insertMany(projects);

//   // Get All Projects + Users From Database
//   // let allProjects = await Project.find();
//   // let allUsers = await User.find();

//   // save users with newly populated project arrays
//   // await allUsers.forEach(async (user) => await user.save());
// };

};

reSeedDatabase()
  .then(() => {
    setTimeout(() => db.close(), 2000);
  }
);
