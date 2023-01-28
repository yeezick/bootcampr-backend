import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Project from '../models/project.js';
import User from '../models/user.js';

export const generateBio = (role) => {
  return `I'm a ${faker.word.adjective()} ${role}. I'm an avid ${faker.word.noun()} lover and I'm passionate about ${faker.word.noun()}s. I'm ${faker.word.adjective()}, ${faker.word.adjective()}, and ${faker.word.adjective()} and look forward to using my skills to build something great!`;
};

export const generateFakeUser = async (role) => {
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };
  return {
    bio: generateBio(role),
    declinedProjects: [],
    email: faker.helpers.unique(faker.internet.email, [name.first, name.last]),
    firstName: name.first,
    githubUrl: `www.github.com/${name.first}-${name.last}`,
    interestedProjects: [],
    lastName: name.last,
    linkedinUrl: `www.linkedin.com/${name.first}-${name.last}`,
    memberOfProjects: [],
    ownerOfProjects: [],
    passwordDigest: await bcrypt.hash('gumballs', 11),
    portfolioProjects: [],
    portfolioUrl: `www.${name.first}${name.last}.com`,
    profilePicture: faker.image.people(640, 480, true),
    role: role,
    savedProjects: [],
    verified: true,
  };
};

export const generateFakeUsers = async (quantity, role) => {
  const users = [];
  for (let i = 0; i < quantity; i++) {
    const newUser = await generateFakeUser(role);
    users.push(new User(newUser));
  }
  return users;
};

export const randomIndex = (length) => Math.floor(Math.random() * length);

export const randomArraySlice = (length) => {
  const startingIndex = Math.floor((Math.random() * length) / 2);
  const endingIndex = Math.floor(Math.random() * length + startingIndex);
  return [startingIndex, endingIndex];
};

export const generateFakeProject = (owner) => {
  const durations = ['1 month', '6 weeks', '2 months', '3 months'];
  const statuses = ['Draft', 'Published'];
  const technologiesUsed = ['JavaScript', 'React', 'HTML', 'CSS', 'Rails', 'Ruby', 'Figma'];

  return new Project({
    duration: durations[randomIndex(durations.length - 1)],
    meeting_cadence: Math.floor(Math.random() * 6 + 1),
    overview: `A ${faker.word.adjective()} app to make ${faker.word.noun()}s more ${faker.word.adjective()}`,
    project_owner: owner,
    // roles: {
    //   engineering: [generateRole(roles.engineering[randomIndex(roles.engineering.length)])],
    //   design: [generateRole(roles.design[randomIndex(roles.design.length)])],
    // },
    status: statuses[randomIndex(statuses.length - 1)],
    technologies_used: [...technologiesUsed.slice(...randomArraySlice(technologiesUsed.length))],
    title: `${faker.word.adjective()} ${faker.word.adjective()}`,
  });
};

// Fisher-Yates Shuffle
export const scrambleArrayOrder = (array) => {
  let currentIndex = array.length,
    randIndex;

  while (currentIndex != 0) {
    randIndex = randomIndex(currentIndex);
    currentIndex--;
    [array[currentIndex], array[randIndex]] = [array[randIndex], array[currentIndex]];
  }
  return array;
};

export const tools = [
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
