import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import Project from '../models/project.js';
import Tool from '../models/tool.js';
import User from '../models/user.js';
import { generateFakeUsers, generateFakeProject, tools, scrambleArrayOrder } from './seedDataHelpers.js';


const reSeedData = async () => {
  // reset database
  await db.dropDatabase();

  // create core user
  const coreUser = new User({
    appliedToProjects: [],
    bio: "Developer PSA: Do not update this user. This user should be immutable and used as a dummy user with pristine data. ",
    declinedProjects: [],
    email: "bootcampr@mail.com",
    firstName: "Boot",
    lastName: "Campr",
    linkedinUrl: "www.linkedin.com/bootcampr",
    memberOfProjects: [],
    ownerOfProjects: [],
    passwordDigest: await bcrypt.hash("pizza12", 11),
    portfolioProjects: [],
    portfolioUrl: "www.bootcampr.com",
    profilePicture: "IMAGE",
    role: "UX Designer",
    savedProjects: []
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
  const allUsers = [...owners, ...joiners]
  await allUsers.forEach(user => user.save())

  // create core project
  const bootcampr = new Project({
    duration: 'Everlasting',
    meetingCadence: 2,
    overview: 'TODO',
    projectOwner: coreUser,
    roles: {
      design: [
        {
          interestedApplicants: [...designers],
          status: "Published" ,
          title: 'TODO',
          description: 'TODO',
          skills: [],
          desiredHeadcount: 5,
        }
      ],
      engineering: [
        {
          interestedApplicants: [...engineers],
          status: "Published" ,
          title: 'TODO',
          description: 'TODO',
          skills: [],
          desiredHeadcount: 5,
        }
      ]
    },
    status: "Published",
    technologiesUsed: ['React', 'Express', 'Figma', 'MongoDB', 'Heroku', 'SCSS'],
    title: 'Bootcampr',
  })

  // create many projects
  const projects = owners.map((owner) => {
    const proj = generateFakeProject(owner);
    owner.ownerOfProjects.push(proj._id);
    owner.memberOfProjects.push(proj._id)
    return proj
  });

  // add core project "bootcampr" to be first in database
  projects.unshift(bootcampr)

  // save (insert) projects in database:
  await Project.insertMany(projects)

  // get all projects from database
  let allProjects = await Project.find();

  // add projects to users arrays round robin style for: apply, decline, memberOf and saved
  joiners.forEach((user) => {
    user.appliedToProjects.push(bootcampr)
    for (let i=1 ; i < allProjects.length ; i++) {
      switch (i%4) {
        case 0:
          user.appliedToProjects.push(allProjects[i])
          const role = user.role === 'Software Engineer' ? 'engineering' : 'design'
          allProjects[i].roles[`${role}`].push(user)
          break
        case 1:
          user.declinedProjects.push(allProjects[i])
          break
        case 2:
          user.memberOfProjects.push(allProjects[i])
          break
        case 3:
          user.savedProjects.push(allProjects[i])
          break
      }
    }
    allProjects = scrambleArrayOrder(allProjects);
  });

  // save users with newly populated project arrays
  await allUsers.forEach(user => user.save())

  await Tool.insertMany(tools);

  db.close();
};

// reSeedData();
