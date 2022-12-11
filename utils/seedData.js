import "dotenv/config.js";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import Project from "../models/project.js";
import Tool from "../models/tool.js";
import User from "../models/user.js";
import { generateFakeUsers, generateFakeProject, tools, scrambleArrayOrder } from './seedDataHelpers.js';

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

// add projects to users arrays round robin style for: apply, decline, memberOf and saved
joiners.forEach((user) => {
  user.appliedToProjects.push(bootcampr)
  for (let i=1 ; i < allProjects.length ; i++) {
    switch (i%4) {
      case 0:
        user.appliedToProjects.push(allProjects[i])
        const role = user.role === 'Software Engineer' ? 'engineering' : 'design'
        allProjects[i].roles[`${role}`].interestedApplicants.push(user)
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
  appliedToProjects = scrambleArrayOrder(appliedToProjects);
});

let testArray = [0,1,2,3,4,5]
console.log(testArray);
testArray = scrambleArrayOrder(testArray)
console.log(testArray)

const insertData = async () => {

<<<<<<< HEAD
  // reset database
  // await db.dropDatabase();
=======
  const user5 = new User({
    bio: "I'm an engineer and I like it",
    declinedProjects: [],
    email: 'engineer1@mail.com',
    firstName: 'Dude',
    interestedProjects: [],
    lastName: 'Guy',
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash('donkeyballs', 11),
    portfolioUrl: 'www.myportfoliostuff.com',
    portfolioProjects: [],
    role: 'Software Engineer',
  });
  await user5.save();

  const user6 = new User({
    bio: 'I like nerd stuff. A lot.',
    declinedProjects: [],
    email: 'lady@mail.com',
    firstName: 'Maria',
    interestedProjects: [],
    lastName: 'Lastname',
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash('usbdongle', 11),
    portfolioUrl: 'www.nerds4nerds.com',
    portfolioProjects: [],
    role: 'Software Engineer',
  });
  await user6.save();

  const user7 = new User({
    bio: ' lets get this bread',
    declinedProjects: [],
    email: 'letsgetthisbread@mail.com',
    firstName: 'BREAD',
    interestedProjects: [],
    lastName: 'CHASER',
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash('makingMoney', 11),
    portfolioUrl: 'www.bootCamper.com',
    portfolioProjects: [],
    role: 'Software Engineer',
  });
  await user7.save();

  const projects = [
    {
      duration: '10',
      meetingCadence: '1 month',
      overview: "It's a rad project",
      projectOwner: user1,
      roles: [
        {
          interestedApplicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desiredHeadcount: 2,
        },
        {
          interestedApplicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desiredHeadcount: 2,
        },
      ],
      status: 'Draft',
      technologiesUsed: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
    {
      duration: '2 months',
      meetingCadence: 'weekly',
      overview: 'Less Rad Project',
      projectOwner: user2,
      roles: [
        {
          interestedApplicants: [user4, user5],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desiredHeadcount: 2,
        },
        {
          interestedApplicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desiredHeadcount: 2,
        },
      ],
      status: 'Published',
      technologiesUsed: ['Figma', 'Chrome'],
      title: 'Extra Lame',
    },
    {
      duration: '10',
      meetingCadence: '1 month',
      overview: "It's a rad project",
      projectOwner: user1,
      roles: [
        {
          interestedApplicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desiredHeadcount: 2,
        },
        {
          interestedApplicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desiredHeadcount: 2,
        },
      ],
      status: 'Draft',
      technologiesUsed: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
    {
      duration: '2 months',
      meetingCadence: 'weekly',
      overview: 'Less Rad Project',
      projectOwner: user2,
      roles: [
        {
          interestedApplicants: [user4, user5],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desiredHeadcount: 2,
        },
        {
          interestedApplicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desiredHeadcount: 2,
        },
      ],
      status: 'Published',
      technologiesUsed: ['Figma', 'Chrome'],
      title: 'Extra Lame',
    },
    {
      duration: '10',
      meetingCadence: '1 month',
      overview: "It's a rad project",
      projectOwner: user1,
      roles: [
        {
          interestedApplicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desiredHeadcount: 2,
        },
        {
          interestedApplicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desiredHeadcount: 2,
        },
      ],
      status: 'Draft',
      technologiesUsed: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
  ];
  await Project.insertMany(projects);
  const allProjects = await Project.find();
>>>>>>> bb3b269 (convert project model properties to camelCase)

  // adding allProjects to each user's memberOfProjects array:
  // user1.memberOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  
  // adding projects to each user's interestedProjects array:
  // user2.interestedProjects.push(allProjects[3], allProjects[4]);

  // adding projects to each user's declinedProjects array:
  // user2.declinedProjects.push(allProjects[2]);

  // await user1.save();
  // await user2.save();

  const allUsersFromDB = User.find();

  // tools

  const tools = [
    {
      category: "Engineering",
      icon: "/assets/icons/javascript.svg",
      name: "JavaScript",
    },
    {
      category: "Engineering",
      icon: "/assets/icons/react.svg",
      name: "React",
    },
    {
      category: "Engineering",
      icon: "/assets/icons/html.svg",
      name: "HTML",
    },
    {
      category: "Engineering",
      icon: "/assets/icons/css.png",
      name: "CSS",
    },
    {
      category: "Engineering",
      icon: "/assets/icons/rails.png",
      name: "Rails",
    },
    {
      category: "Engineering",
      icon: "/assets/icons/ruby.svg",
      name: "Ruby",
    },
    {
      category: "Design",
      icon: "/assets/icons/figma.svg",
      name: "Figma",
    },
  ];
  await Tool.insertMany(tools);
  // const allTools = await Tool.find();

  db.close();
};

// insertData();
