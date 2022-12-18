import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../db/connection.js';
import Project from '../models/project.js';
import Tool from '../models/tool.js';
import User from '../models/user.js';

/**
 * Whoever refactors this file, please make sure of the following:
 * - memberOfProjects, ownerOfProjects, etc all make sense
 * - User models / references don't clash
 *    EX: a user is in "interestedApplicant" and "DeclinedProject" of the same project
 *
 * I've only adapted these to fit the new schemas to avoid breaking in execution, I have not checked the logic of this file.
 *
 * Feel free to take initative and organize this file. It needs structure!!
 * If you organize, think about how we can make it easy to update in the future too.
 */

const insertData = async () => {
  //reset database

  await db.dropDatabase();

  const user1 = new User({
    bio: 'American whole magazine truth stop whose. On traditional measure example sense peace. Would mouth relate own chair. Role together range line. Government first policy daughter.',
    customProfileLinks: [
      {
        customUrlName: 'github',
        customUrlLink: 'www.github.com/mendo94435345',
      },
      {
        customUrlName: 'twitter',
        customUrlLink: 'www.twitter.com/dingus',
      },
    ],
    declinedProjects: [],
    email: 'lagtestuy@mail.com',
    firstName: 'Wiggle',
    interestedProjects: [],
    lastName: 'Jones',
    linkedinUrl: 'www.linkedin.com',
    memberOfProjects: [],
    ownerOfProjects: [],
    passwordDigest: await bcrypt.hash('gumballs', 11),
    portfolioUrl: 'www.wigglejones.com',
    portfolioProjects: [],
    profilePicture: 'IMAGE',
    role: 'Software Engineer',
    savedProjects: [],
  });
  await user1.save();

  const user2 = new User({
    bio: 'Developer PSA: Do not update this user. This user should be immutable and used as a dummy user with pristine date. ',
    declinedProjects: [],
    email: 'laguy@mail.com',
    firstName: 'Mike',
    interestedProjects: [],
    lastName: 'Hunt',
    linkedinUrl: 'www.linkedin.com',
    memberOfProjects: [],
    ownerOfProjects: [],
    passwordDigest: await bcrypt.hash('pizza12', 11),
    portfolioUrl: 'www.ladesigner.com',
    portfolioProjects: [],
    profilePicture: 'IMAGE',
    role: 'UX Designer',
    savedProjects: [],
  });
  await user2.save();

  const user3 = new User({
    bio: 'I code for fun',
    declinedProjects: [],
    email: 'barbra@mail.com',
    firstName: 'Barbra',
    lastName: 'Woo',
    interestedProjects: [],
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash('gumballs', 11),
    portfolioUrl: 'www.bras.com',
    portfolioProjects: [],
    role: 'Software Engineer',
  });
  await user3.save();

  const user4 = new User({
    bio: 'I like all the colors!',
    declinedProjects: [],
    email: 'wondergirl@mail.com',
    firstName: 'Stephanie',
    interestedProjects: [],
    lastName: 'Carter',
    memberOfProjects: [],
    passwordDigest: await bcrypt.hash('gumballs', 11),
    portfolioUrl: 'www.colorsofrainbows.com',
    portfolioProjects: [],
    role: 'UX Designer',
    profilePicture: '',
  });
  await user4.save();

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
    profilePicture: '',
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
    profilePicture: '',
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
    profilePicture: '',
  });
  await user7.save();

  const projects = [
    {
      duration: '10',
      meeting_cadence: '1 month',
      overview: "It's a rad project",
      project_owner: user1,
      roles: [
        {
          interested_applicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desired_headcount: 2,
        },
        {
          interested_applicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desired_headcount: 2,
        },
      ],
      status: 'Draft',
      technologies_used: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
    {
      duration: '2 months',
      meeting_cadence: 'weekly',
      overview: 'Less Rad Project',
      project_owner: user2,
      roles: [
        {
          interested_applicants: [user4, user5],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desired_headcount: 2,
        },
        {
          interested_applicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desired_headcount: 2,
        },
      ],
      status: 'Published',
      technologies_used: ['Figma', 'Chrome'],
      title: 'Extra Lame',
    },
    {
      duration: '10',
      meeting_cadence: '1 month',
      overview: "It's a rad project",
      project_owner: user1,
      roles: [
        {
          interested_applicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desired_headcount: 2,
        },
        {
          interested_applicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desired_headcount: 2,
        },
      ],
      status: 'Draft',
      technologies_used: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
    {
      duration: '2 months',
      meeting_cadence: 'weekly',
      overview: 'Less Rad Project',
      project_owner: user2,
      roles: [
        {
          interested_applicants: [user4, user5],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desired_headcount: 2,
        },
        {
          interested_applicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desired_headcount: 2,
        },
      ],
      status: 'Published',
      technologies_used: ['Figma', 'Chrome'],
      title: 'Extra Lame',
    },
    {
      duration: '10',
      meeting_cadence: '1 month',
      overview: "It's a rad project",
      project_owner: user1,
      roles: [
        {
          interested_applicants: [user1, user3],
          status: 'Draft',
          category: 'Software Engineer',
          title: 'Software Engineer',
          description: 'Must be able to code.',
          skills: ['React', 'JavaScript'],
          desired_headcount: 2,
        },
        {
          interested_applicants: [user2, user4],
          status: 'Published',
          category: 'UX Designer',
          title: 'UX Designer',
          description: 'Must be able to UX Design.',
          skills: ['Figma', 'Chrome'],
          desired_headcount: 2,
        },
      ],
      status: 'Draft',
      technologies_used: ['VSCode', 'Chrome'],
      title: 'Extra Radical',
    },
  ];
  await Project.insertMany(projects);
  const allProjects = await Project.find();

  // adding allProjects to each user's memberOfProjects array:
  user1.memberOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  user1.ownerOfProjects.push(allProjects[1], allProjects[2], allProjects[4]);
  user2.memberOfProjects.push(allProjects[0]);
  user3.memberOfProjects.push(allProjects[1], allProjects[3]);
  user4.memberOfProjects.push();

  // adding projects to each user's interestedProjects array:
  user2.interestedProjects.push(allProjects[3], allProjects[4]);
  user3.interestedProjects.push(allProjects[0]);
  user4.interestedProjects.push(allProjects[0], allProjects[1], allProjects[2]);

  // adding projects to each user's declinedProjects array:
  user2.declinedProjects.push(allProjects[2]);
  user3.declinedProjects.push(allProjects[3]);

  // add project to savedProjects and ownerOfProjects
  // user1.

  await user1.save();
  await user2.save();
  await user3.save();
  await user4.save();

  const allUsers = User.find();

  // tools

  const tools = [
    {
      category: 'Engineering',
      icon: '/assets/icons/javascript.svg',
      name: 'JavaScript',
    },
    {
      category: 'Engineering',
      icon: '/assets/icons/react.svg',
      name: 'React',
    },
    {
      category: 'Engineering',
      icon: '/assets/icons/html.svg',
      name: 'HTML',
    },
    {
      category: 'Engineering',
      icon: '/assets/icons/css.png',
      name: 'CSS',
    },
    {
      category: 'Engineering',
      icon: '/assets/icons/rails.png',
      name: 'Rails',
    },
    {
      category: 'Engineering',
      icon: '/assets/icons/ruby.svg',
      name: 'Ruby',
    },
    {
      category: 'Design',
      icon: '/assets/icons/figma.svg',
      name: 'Figma',
    },
  ];
  await Tool.insertMany(tools);
  const allTools = await Tool.find();

  db.close();
};

insertData();
