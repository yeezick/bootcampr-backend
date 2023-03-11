import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Project from '../models/project.js';
import User from '../models/user.js';
import { generateRandomSingleDayAvailability } from './availability.js';

// Either organize this file by User Utils, Project Utils, etc. 
// OR design file structure to better seperate concerns

/**
 * Generate User Bio
 * @param {enum: ['Software Engineer', 'UX Designer']} role 
 * @returns {String} uniquely generated personal bio
 */
export const generateBio = (role) => {
  const adjective1 = faker.word.adjective()
  const preAdjective = ['a', 'e', 'i', 'o', 'u']
    .includes(adjective1.charAt(0)) ? 'an' : 'a'

  return [
    `I'm ${preAdjective} ${adjective1} ${role}.`, 
    `I'm an avid ${faker.word.noun()} lover and I'm passionate about ${faker.word.noun()}s.`,
    `I'm ${faker.word.adjective()}, ${faker.word.adjective()}, and ${faker.word.adjective()}`,
    `and look forward to using my skills to build something ${faker.word.adjective()}.`,
    `Let's get ${faker.word.adjective()}!`
  ].join(' ')
};

/**
 * Generate Fake User
 * @param {enum: ['Software Engineer', 'UX Designer']} role 
 * @returns a User object with randomly generated user data
 * 
 */
export const generateFakeUser = async (role) => {
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };

  return {
    availability: {
      sunday: JSON.stringify(generateRandomSingleDayAvailability()),
      monday: JSON.stringify(generateRandomSingleDayAvailability()),
      tuesday: JSON.stringify(generateRandomSingleDayAvailability()),
      wednesday: JSON.stringify(generateRandomSingleDayAvailability()),
      thursday: JSON.stringify(generateRandomSingleDayAvailability()),
      friday: JSON.stringify(generateRandomSingleDayAvailability()),
      saturday: JSON.stringify(generateRandomSingleDayAvailability())
    },
    bio: generateBio(role),
    email: faker.helpers.unique(faker.internet.email, [name.first, name.last]),
    firstName: name.first,
    lastName: name.last,
    links: {
      githubUrl: `www.github.com/${name.first}-${name.last}`,
      linkedinUrl: `www.linkedin.com/${name.first}-${name.last}`,
      portfolioUrl: `www.${name.first}${name.last}.com`,
    },
    passwordDigest: await bcrypt.hash('gumballs', 11),
    profilePicture: faker.image.people(640, 480, true),
    role,
    verified: true,
  };
};

/**
 * Generate Multiple Fake Users
 * @param {Number} quantity of users to create
 * @param {enum: ['Software Engineer', 'UX Designer']} role type of Users to create
 * @returns {Array<User>} an array of randomly generated users of indicated role type
 * 
 */
export const generateFakeUsers = async (quantity, role) => {
  const users = [];
  for (let i = 0; i < quantity; i++) {
    const newUser = await generateFakeUser(role);
    users.push(new User(newUser));
  }
  return users;
};

/**
 * Generate a Random Index
 * @param {Number} length of array you need a random Index for
 * @returns {Number} index to access random element of an array
 * 
 */
export const randomIndex = (length) => Math.floor(Math.random() * length);

/**
 * Select a random subsection of an array
 *  - Use case was to select random tools from array of project tools - not needed now?
 * @param {Number} length of Array you'll be slicing
 * @returns 2 Element array with starting and ending index for random slice
 */
export const randomArraySlice = (length) => {
  const startingIndex = Math.floor((Math.random() * length) / 2);
  const endingIndex = Math.floor(Math.random() * length + startingIndex);
  return [startingIndex, endingIndex];
};

// Can be adapted as needed
const defaultProject = {
  title: 'Project Title',
  goal: 'Project Goal',
  problem: 'Project Problem',
  startDate: Date.now(),
  duration: 28,
}

// PROJECT UTILS
/**
 * Generate Project
 * @param {Object} project custom options including: title, goal, problem, startDate and duration
 * @returns 
 */
export const generateProject = (project = defaultProject) => {
  const { title, goal, problem, startDate, duration } = project
  // TODO: adjust start and end date format and calulcations as needed
  const endDate = Date.now() + duration * 24 * 60 * 60 * 60

  return {
    chats: [],
    goal,
    meetings: [],
    members: {
      engineers: [],
      designers: [],
    },
    problem,
    tasks: [],
    timeline: {
      startDate,
      endDate,
    },
    title,
  }
}


// Fisher-Yates Shuffle
/**
 * Fisher-Yates Shuffle
 * @param {Array} array 
 * @returns same array with element order shuffled
 */
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


