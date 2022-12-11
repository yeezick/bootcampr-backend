import "dotenv/config.js";import "dotenv/config.js";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import Project from "../models/project.js";
import Tool from "../models/tool.js";
import User from "../models/user.js";
import { 
  generateFakeUsers, 
  generateFakeProject, 
  tools, 
  scrambleArrayOrder } from './seedDataHelpers.js';


const reSeedDatabase = async () => {

  // reset database
  await db.dropDatabase();

  // create core user
  const coreUser = new User({
    bio: "Developer PSA: Do not update this user. This user should be immutable and used as a dummy user with pristine data. ",
    declinedProjects: [],
    email: "bootcampr@mail.com",
    firstName: "Boot",
    interestedProjects: [],
    lastName: "Campr",
    linkedinUrl: "www.linkedin.com/bootcampr",
    memberOfProjects: [],
    ownerOfProjects: [],
    passwordDigest: await bcrypt.hash("pizza12", 11),
    portfolioProjects: [],
    portfolioUrl: "www.bootcampr.com",
    profilePicture: "IMAGE",
    role: "UX Designer",
    savedProjects: [],
    verified: true
  });
  await coreUser.save();

  // create set of users who will be project owners
  const owners = []
  owners.push(...await generateFakeUsers(10, 'Software Engineer'))
  owners.push(...await generateFakeUsers(10, 'UX Designer'))

  // create a set of engineers, and a set of designers who will be project 'joiners'
  const engineers = await generateFakeUsers(10, 'Software Engineer')
  const designers = await generateFakeUsers(10, 'UX Designer')
  const joiners = [...engineers, ...designers]

  // save users to database:
  const allNewUsers = [...owners, ...joiners]
  await allNewUsers.forEach(user => user.save())

  // create core project
  const bootcampr = new Project({
    duration: 'Everlasting',
    meetingCadence: 2,
    overview: 'Our platform enables students and recent graduates of Design and Development Programs to connect in a realistic work environment where they can practice and refine their skills.',
    projectOwner: coreUser,
    roles: {
      design: [
        {
          interestedApplicants: [...designers],
          status: "Published" ,
          title: 'UX Designer',
          description: 'Will work on evolving designs collaboratively with other designers and engineers, perform market research and manage a team of designers',
          skills: ['Figma', 'Adobe Photoshop', 'Adobe Illustrator'],
          desiredHeadcount: 5,
        }
      ],
      engineering: [
        {
          interestedApplicants: [...engineers],
          status: "Published" ,
          title: 'Full Stack Software Engineer',
          description: 'An engineer who loves problem solving, is passionate about delivering excellent user-experience, and collaborating with all types of engineers and designers,',
          skills: ['React', 'Figma', 'SCSS', 'Node.js', 'Express', 'MongoDB'],
          desiredHeadcount: 5,
        }
      ]
    },
    status: "Published",
    technologiesUsed: ['React', 'Express', 'Figma', 'MongoDB', 'Heroku', 'SCSS'],
    title: 'Bootcampr',
  });

  coreUser.ownerOfProjects.push(bootcampr._id);
  coreUser.memberOfProjects.push(bootcampr._id);
  await coreUser.save()

  // create many projects
  const projects = owners.map((owner) => {
    const proj = generateFakeProject(owner);
    owner.ownerOfProjects.push(proj._id);
    owner.memberOfProjects.push(proj._id)
    return proj
  });

  owners.forEach(async (owner) => await owner.save());

  // add core project "bootcampr" to be first in database
  projects.unshift(bootcampr)

  // save/insert projects in database
  await Project.insertMany(projects)

  // get all projects + usersfrom database
  let allProjects = await Project.find();
  let allUsers = await User.find();

  // add projects to users arrays round robin style for: interested, declined, memberOf and saved
  allUsers.forEach((user) => {
  
    // all users are interested in bootcampr (duh)
    user.interestedProjects.push(bootcampr)

    if (user.ownerOfProjects.length > 0) return;

    for (let i = 1 ; i < allProjects.length ; i++) {
      switch ( i % 4 ) {
        case 0:
          user.interestedProjects.push(allProjects[i]._id)
          const role = user.role === 'Software Engineer' ? 'engineering' : 'design'
          allProjects[i].roles[role].push(user)
          break
        case 1:
          user.declinedProjects.push(allProjects[i]._id)
          break
        case 2:
          user.memberOfProjects.push(allProjects[i]._id)
          break
        case 3:
          user.savedProjects.push(allProjects[i]._id)
          break
      }
    }
    allProjects = scrambleArrayOrder(allProjects);
  });

  // save users with newly populated project arrays
  await allUsers.forEach(async user => await user.save())

  await Tool.insertMany(tools);
};

reSeedDatabase()
  .then(() => db.close())