import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import Project from '../models/project.js';
import User from '../models/user.js';
import { generateRandomSingleDayAvailability } from './availability.js'
import { 
  generateFakeUsers, 
  generateProject, 
  scrambleArrayOrder } from './seedDataHelpers.js';

const reSeedDatabase = async () => {
  // reset database
  // await db.dropDatabase();

  // Create Project Types Info for input
  const projectThemes = {
    charity: {},
    travel: {},
    intersts: {}
  }

  // Create 5 Projects of the same Type
  // Default startDate is today (Date....)
  // Default duration is 4 weeks aka 28 days
  const projects = []
  for (let i=0 ; i < 5; i++) {
    projects.push(generateProject())
  }
  // Array(5).forEach((project) => projects.push(generateProject()))
  console.log('PROJECTS:')
  console.log(projects)

  // Save Projects to DB

  const designers = await generateFakeUsers(10, 'UX Designer')
  const engineers = await generateFakeUsers(15, 'Software Engineer')
  const users = [...designers, ...engineers]

  // Assign Designers to Projects
  for (let u = 0; u < users.length ; u++) {
    const userRole = users[u].role === 'Software Engineer' ? 'engineers' : 'designers'

    console.log(users[u])

    const idx = u % projects.length
    console.log(projects[idx])
    projects[idx].members[userRole].push(users[u]._id)
  }


  projects.forEach(project => console.log(project.members.designers))

  // Create 25 Users, dispersed among the 5 unique projects

  // Plan out Availability Logic for Teams





  // await coreUser.save();
  // Update the generateFakeUsers function first
  // users.push(...(await generateFakeUsers(10, 'Software Engineer')));
  // users.push(...(await generateFakeUsers(10, 'UX Designer')));

  // Save users to database
  // await users.forEach((user) => user.save());

  // Create Core Project
  // const bootcampr = new Project({
  //   duration: 'Everlasting',
  //   meetingCadence: 2,
  //   overview:
  //     'Our platform enables students and recent graduates of Design and Development Programs to connect in a realistic work environment where they can practice and refine their skills.',
  //   projectOwner: coreUser,
  //   roles: {
  //     design: [
  //       {
  //         interestedApplicants: [...designers],
  //         status: 'Published',
  //         title: 'UX Designer',
  //         description:
  //           'Will work on evolving designs collaboratively with other designers and engineers, perform market research and manage a team of designers',
  //         skills: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
  //         desiredHeadcount: 5,
  //       },
  //     ],
  //     engineering: [
  //       {
  //         interestedApplicants: [...engineers],
  //         status: 'Published',
  //         title: 'Full Stack Software Engineer',
  //         description:
  //           'An engineer who loves problem solving, is passionate about delivering excellent user-experience, and collaborating with all types of engineers and designers,',
  //         skills: ['React', 'Figma', 'SCSS', 'Node.js', 'Express', 'MongoDB'],
  //         desiredHeadcount: 5,
  //       },
  //     ],
  //   },
  //   status: 'Published',
  //   technologiesUsed: ['React', 'Express', 'Figma', 'MongoDB', 'Heroku', 'SCSS'],
  //   title: 'Bootcampr',
  // });

  // create many projects
  // const projects = owners.map((owner) => {
  //   const proj = generateFakeProject(owner);
  //   owner.ownerOfProjects.push(proj._id);
  //   owner.memberOfProjects.push(proj._id);
  //   return proj;
  // });

  // owners.forEach(async (owner) => await owner.save());

  // add core project "bootcampr" to be first in database
  // projects.unshift(bootcampr);

  // save/insert projects in database
  // await Project.insertMany(projects);

  // get all projects + usersfrom database
  // let allProjects = await Project.find();
  // let allUsers = await User.find();

  // save users with newly populated project arrays
  // await allUsers.forEach(async (user) => await user.save());
  
  console.log(Date.now())
};

reSeedDatabase()
// .then(() => {
//   setTimeout(() => db.close(), 2000);
// });
