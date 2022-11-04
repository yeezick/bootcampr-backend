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
    about:
      "American whole magazine truth stop whose. On traditional measure example sense peace. Would mouth relate own chair. Role together range line. Government first policy daughter.",
    email: "lagtestuy@mail.com",
    first_name: "Wiggle",
    interested_projects: [],
    last_name: "Jones",
    fun_fact: "I like turtles",
    member_of_projects: [],
    password_digest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.wigglejones.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "Software Engineer",
    show_portfolio: true,
  });
  await user1.save();

  const user2 = new User({
    about: "Designer for LA",
    email: "laguy@mail.com",
    first_name: "Mike",
    interested_projects: [],
    last_name: "Hunt",
    member_of_projects: [],
    password_digest: await bcrypt.hash("pizza12", 11),
    portfolio_link: "www.ladesigner.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "UX Designer",
  });
  await user2.save();

  const user3 = new User({
    about: "I code for fun",
    email: "barbra@mail.com",
    first_name: "Barbra",
    last_name: "Woo",
    interested_projects: [],
    member_of_projects: [],
    password_digest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.bras.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user3.save();

  const user4 = new User({
    about: "I like all the colors!",
    email: "wondergirl@mail.com",
    first_name: "Stephanie",
    interested_projects: [],
    last_name: "Carter",
    member_of_projects: [],
    password_digest: await bcrypt.hash("gumballs", 11),
    portfolio_link: "www.colorsofrainbows.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "UX Designer",
  });
  await user4.save();

  const user5 = new User({
    about: "I'm an engineer and I like it",
    email: "engineer1@mail.com",
    first_name: "Dude",
    interested_projects: [],
    last_name: "Guy",
    member_of_projects: [],
    password_digest: await bcrypt.hash("donkeyballs", 11),
    portfolio_link: "www.myportfoliostuff.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user5.save();

  const user6 = new User({
    about: "I like nerd stuff. A lot.",
    email: "lady@mail.com",
    first_name: "Maria",
    interested_projects: [],
    last_name: "Lastname",
    member_of_projects: [],
    password_digest: await bcrypt.hash("usbdongle", 11),
    portfolio_link: "www.nerds4nerds.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user6.save();

  const user7 = new User({
    about: " lets get this bread",
    email: "letsgetthisbread@mail.com",
    first_name: "BREAD",
    interested_projects: [],
    last_name: "CHASER",
    member_of_projects: [],
    password_digest: await bcrypt.hash("makingMoney", 11),
    portfolio_link: "www.bootCamper.com",
    portfolio_projects: [],
    rejected_projects: [],
    role: "Software Engineer",
  });
  await user7.save();

  const projects = [
    {
      overview: "building gaming app",
      // designer_count: 1,
      // engineer_count: 1,
      interested_applicants: [user3, user4, user5, user6], // projects[0]
      // seeking: true,
      // team_members: [user2],
      meeting_cadence: 'no preference',
      title: "GameBot",
      technologies_used: ["C#"],
      // tools: [],
      project_owner: user1,
      duration: "1 month",
      status: "Published"
    },
    {
      overview: "Painting app",
      interested_applicants: [user4], //projects[1]
      meeting_cadence: "hobby",
      title: "PaintBot",
      technologies_used: ["Java", "Spring"],
      project_owner: user2,
      duration: "2 months",
      status: "Published"
    },
    {
      overview: "gardening app",
      interested_applicants: [user4], //projects[2]
      meeting_cadence: "part-time",
      title: "GardenBot",
      project_owner: user3,
      technologies_used: ["React", "AWS"],
      duration: "3 months",
      status: "Published"
    },
    {
      overview: "babysitter app",
      interested_applicants: [user2], //projects[3]
      meeting_cadence: "full-time",
      title: "BabysitterBot",
      project_owner: user4,
      technologies_used: ["HTML", "CSS"],
      duration: "4 months",
      status: "Published"
    },
    {
      overview: "finance app",
      interested_applicants: [user2], //projects[4]
      meeting_cadence: "full-time",
      title: "MyMoney.io",
      technologies_used: ["HTML", "CSS"],
      status: "Published",
      duration: "2 months",
      project_owner: user4,
    },
  ];
  await Project.insertMany(projects);
  const allProjects = await Project.find();
  // const projArr = (await project1).forEach((project) =>
  //   console.log("Project:", project)
  // );

  // console.log("first", project1[0]);
  // adding allProjects to each user's member_of_projects array:
  user1.member_of_projects.push(allProjects[1], allProjects[2], allProjects[4]);
  user2.member_of_projects.push(allProjects[0]);
  user3.member_of_projects.push(allProjects[1], allProjects[3]);
  user4.member_of_projects.push();

  // adding projects to each user's interested_projects array:
  user2.interested_projects.push(allProjects[3], allProjects[4]);
  user3.interested_projects.push(allProjects[0]);
  user4.interested_projects.push(
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
