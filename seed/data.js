import "dotenv/config.js";
import bcrypt from "bcrypt";
import db from "../db/connection.js";
import Project from "../models/project.js";
import Tool from "../models/tool.js";
import User from "../models/user.js";

const insertData = async () => {
  //reset database

  await db.dropDatabase();

  const user1 = new User({
    bio:
      "American whole magazine truth stop whose. On traditional measure example sense peace. Would mouth relate own chair. Role together range line. Government first policy daughter.",
    email: "lagtestuy@mail.com",
    firstName: "Wiggle",
    interestedProjects: [],
    lastName: "Jones",
    fun_fact: "I like turtles",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.wigglejones.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "Software Engineer",
    show_portfolio: true,
  });
  await user1.save();

  const user2 = new User({
    bio: "Designer for LA",
    email: "laguy@mail.com",
    firstName: "Mike",
    interestedProjects: [],
    lastName: "Hunt",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("pizza12", 11),
    portfolio_link: "www.ladesigner.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "UX Designer",
  });
  await user2.save();

  const user3 = new User({
    bio: "I code for fun",
    email: "barbra@mail.com",
    firstName: "Barbra",
    lastName: "Woo",
    interestedProjects: [],
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.bras.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user3.save();

  const user4 = new User({
    bio: "I like all the colors!",
    email: "wondergirl@mail.com",
    firstName: "Stephanie",
    interestedProjects: [],
    lastName: "Carter",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.colorsofrainbows.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "UX Designer",
  });
  await user4.save();

  const user5 = new User({
    bio: "I'm an engineer and I like it",
    email: "engineer1@mail.com",
    firstName: "Dude",
    interestedProjects: [],
    lastName: "Guy",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("donkeyballs", 11),
    portfolio_link: "www.myportfoliostuff.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user5.save();

  const user6 = new User({
    bio: "I like nerd stuff. A lot.",
    email: "lady@mail.com",
    firstName: "Maria",
    interestedProjects: [],
    lastName: "Lastname",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("usbdongle", 11),
    portfolio_link: "www.nerds4nerds.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user6.save();

  const user7 = new User({
    bio: " lets get this bread",
    email: "letsgetthisbread@mail.com",
    firstName: "BREAD",
    interestedProjects: [],
    lastName: "CHASER",
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash("makingMoney", 11),
    portfolio_link: "www.bootCamper.com",
    portfolioProjects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user7.save();

  const projects = [
    {
      description: "building gaming app",
      designer_count: 1,
      engineer_count: 1,
      interested_applicants: [user3, user4, user5, user6], // projects[0]
      seeking: true,
      team_members: [user2],
      time_commitment: "no preference",
      title: "GameBot",
      tools: [],
      owner: user1,
    },
    {
      description: "Painting app",
      designer_count: 1,
      engineer_count: 1,
      interested_applicants: [user4], //projects[1]
      seeking: true,
      team_members: [user1, user3],
      time_commitment: "hobby",
      title: "PaintBot",
      tools: [],
      owner: user2,
    },
    {
      description: "gardening app",
      designer_count: 2,
      engineer_count: 2,
      interested_applicants: [user4], //projects[2]
      seeking: false,
      team_members: [user2, user1],
      time_commitment: "part-time",
      title: "GardenBot",
      tools: [],
      owner: user3,
    },
    {
      description: "babysitter app",
      designer_count: 1,
      engineer_count: 2,
      interested_applicants: [user2], //projects[3]
      seeking: true,
      team_members: [user3],
      time_commitment: "full-time",
      title: "BabysitterBot",
      tools: [],
      owner: user4,
    },
    {
      description: "finance app",
      designer_count: 1,
      engineer_count: 3,
      interested_applicants: [user2], //projects[4]
      seeking: true,
      team_members: [user1, user3],
      time_commitment: "full-time",
      title: "MyMoney.io",
      tools: [],
      owner: user4,
    },
  ];
  await Project.insertMany(projects);
  const allProjects = await Project.find();
  // const projArr = (await project1).forEach((project) =>
  //   console.log("Project:", project)
  // );

  // console.log("first", project1[0]);
  // adding allProjects to each user's memberOfProjects array:
  user1.memberOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  user2.memberOfProjects.push(allProjects[0]);
  user3.memberOfProjects.push(allProjects[1], allProjects[3]);
  user4.memberOfProjects.push();

  // adding projects to each user's interestedProjects array:
  user2.interestedProjects.push(allProjects[3], allProjects[4]);
  user3.interestedProjects.push(allProjects[0]);
  user4.interestedProjects.push(
    allProjects[0],
    allProjects[1],
    allProjects[2]
  );

  // adding projects to each user's rejected_projects array:
  user2.rejected_projects.push(allProjects[2]);
  user3.rejected_projects.push(allProjects[3]);

  await user1.save();
  await user2.save();
  await user3.save();
  await user4.save();

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

insertData();
