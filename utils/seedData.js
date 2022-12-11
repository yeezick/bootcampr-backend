import "dotenv/config.js";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import Project from "../models/project.js";
import Tool from "../models/tool.js";
import User from "../models/user.js";
import { 
  generateFakeUser, 
  generateFakeUsers, 
  tools, 
  generateFakeProject } from './seedDataHelpers.js';

/**
 * 1. build user generator - DONE
 * 2. generate an array of 10 SWE users - DONE
 * 3. generate an array of 10 UX users - DONE
 * 4. build project generator - DONE
 * 5. Decide how to automate project generation considering: owner, interested, roles, etc.
 * 6. Build project / user assigner function
 * 7. run and test functionality
 */

const engineers = await generateFakeUsers(10, 'Software Engineer')
const designers = await generateFakeUsers(10, 'UX Designer')

const user1 = await generateFakeUser('Software Engineer')
const project1 = generateFakeProject(user1)


const insertData = async () => {
// Let this be the core/constant user
  const user2 = new User({
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
    portfolioUrl: "www.bootcampr.com",
    portfolioProjects: [],
    profilePicture: 'IMAGE',
    role: 'UX Designer',
    savedProjects: [],
  });
  await user2.save();

  //reset database
  await db.dropDatabase();

  // Users that are looking to host / own projects
  const usersToOwnProjects = [];

  // Users that are looking to join projects
  const usersToJoinProjects = [];

  // iterate through owners group to assign as owners, and joiners to assign as interested / not interested etc.
  const projects = [];


  await Project.insertMany(projects);
  const allProjects = await Project.find();

  // adding allProjects to each user's memberOfProjects array:
  // user1.memberOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  // user2.memberOfProjects.push(allProjects[0]);
  // user3.memberOfProjects.push(allProjects[1], allProjects[3]);
  // user4.memberOfProjects.push();

  // adding projects to each user's interestedProjects array:
  // user2.interestedProjects.push(allProjects[3], allProjects[4]);
  // user3.interestedProjects.push(allProjects[0]);
  // user4.interestedProjects.push(
  //   allProjects[0],
  //   allProjects[1],
  //   allProjects[2]
  // );

  // adding projects to each user's declinedProjects array:
  // user2.declinedProjects.push(allProjects[2]);
  // user3.declinedProjects.push(allProjects[3]);

  // add project to savedProjects and ownerOfProjects
  // user1.

  // await user1.save();
  // await user2.save();
  // await user3.save();
  // await user4.save();

  const allUsers = User.find();

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
  const allTools = await Tool.find();

  db.close();
};

// insertData();
