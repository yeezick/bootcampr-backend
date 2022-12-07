import "dotenv/config.js";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import Project from "../models/project.js";
import Tool from "../models/tool.js";
import User from "../models/user.js";
import { generateFakeUsers, generateFakeProject, tools } from './seedDataHelpers.js';

/**
 * 1. build user generator - DONE
 * 2. generate an array of 10 SWE users - DONE
 * 3. generate an array of 10 UX users - DONE
 * 4. build project generator - DONE
 * 5. Decide how to automate project generation considering: owner, interested, roles, etc. - DONE
 * 6. Build project / user assigner function - DONE
 * 7. run and test functionality
 */

// create core user
const coreUser = new User({
  bio: "Developer PSA: Do not update this user. This user should be immutable and used as a dummy user with pristine data. ",
  declinedProjects: [],
  email: "bootcampr@mail.com",
  firstName: "Boot",
  appliedToProjects: [],
  lastName: "Campr",
  linkedinUrl: "www.linkedin.com/bootcampr",
  memberOfProjects: [],
  ownerOfProjects: [],
  passwordDigest: await bcrypt.hash("pizza12", 11),
  portfolioUrl: "www.bootcampr.com",
  portfolioProjects: [],
  profilePicture: "IMAGE",
  role: "UX Designer",
  savedProjects: []
});
await coreUser.save();

// create set of users who will be project owners
const owners = []
owners.push(...await generateFakeUsers(5, 'Software Engineer'))
owners.push(...await generateFakeUsers(5, 'UX Designer'))

// create a set of engineers, and a set of designers who will be project 'joiners'
const engineers = await generateFakeUsers(10, 'Software Engineer')
const designers = await generateFakeUsers(10, 'UX Designer')
const joiners = [...engineers, ...designers]

// save users to database:
const allUsers = [...owners, ...engineers, ...designers]
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
  return proj
})

// add core project "bootcampr" to be first in database
projects.unshift(bootcampr)

// save (insert) projects in database:
await Project.insertMany(projects)

// get all projects from database
const allProjects = await Project.find();

// add projects to users arrays
joiners.forEach((user) => {

  for (let i=0 ; i < projects.length ; i++) {
    // if project = bootcampr, apply case ? or skip and apply else where?
    switch (i%4) {
      case 0:
        // apply
        user.appliedToProjects.push(project[i])
        const role = user.role === 'Software Engineer' ? 'engineering' : 'design'
        project[i].roles[role].interestedApplicants.push(user)
        break
      case 1:
        // decline
        user.declinedProjects.push(project[i])
        break
      case 2:
        // member
        user.memberOfProjects.push(project[i])
        break
      case 3:
        // save
        user.memberOfProjects.push(project[i])
        break
    }
  }
  //scramble project order
})

const insertData = async () => {

  // reset database
  // await db.dropDatabase();

  // adding allProjects to each user's memberOfProjects array:
  // user1.memberOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  
  // adding projects to each user's interestedProjects array:
  // user2.interestedProjects.push(allProjects[3], allProjects[4]);

  // adding projects to each user's declinedProjects array:
  // user2.declinedProjects.push(allProjects[2]);

  // await user1.save();
  // await user2.save();

  const allUsersFromDB = User.find();

  await Tool.insertMany(tools);
  // const allTools = await Tool.find();

  db.close();
};

// insertData();
