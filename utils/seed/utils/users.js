import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import User from '../../../models/user.js';
import { generateRandomSingleDayAvailability } from '../../availability.js';

/**
 * Generate User Bio
 * @param {enum: ['Software Engineer', 'UX Designer']} role
 * @returns {String} uniquely generated personal bio
 */
export const generateBio = (role) => {
  const adjective1 = faker.word.adjective();
  const preAdjective = ['a', 'e', 'i', 'o', 'u'].includes(adjective1.charAt(0)) ? 'an' : 'a';

  return [
    `I'm ${preAdjective} ${adjective1} ${role}.`,
    `I'm an avid ${faker.word.noun()} lover and I'm passionate about ${faker.word.noun()}s.`,
    `I'm ${faker.word.adjective()}, ${faker.word.adjective()}, and ${faker.word.adjective()}`,
    `and look forward to using my skills to build something ${faker.word.adjective()}.`,
    `Let's get ${faker.word.adjective()}!`,
  ].join(' ');
};

/**
 * Generate Fake User
 * @param {enum: ['Software Engineer', 'UX Designer']} role
 * @returns a User object with randomly generated user data
 */
export const generateFakeUser = async (role, defaultInfo) => {
  const name = {
    first: faker.name.firstName(),
    last: faker.name.lastName(),
  };

  return {
    availability: {
      SUN: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      MON: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      TUE: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      WED: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      THU: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      FRI: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
      SAT: {
        available: true,
        availability: generateRandomSingleDayAvailability(),
      },
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
    project: null,
    role,
    timezone: 'TBD',
    verified: true,
    ...defaultInfo, // has to go last to overwrrite previous assignments
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
 *
 * @param {Array} users object
 * @returns Array of User ObjectIds
 */
export const getIds = (users) => {
  const ids = users.map((user) => user._id);
  return ids;
};
