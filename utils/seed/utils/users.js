import { randUser, randAvatar, randQuote } from '@ngneat/falso';
import bcrypt from 'bcrypt';
import User from '../../../models/user.js';
import { generateRealisticSingleDayAvailability } from '../../availability.js';

/**
 * Generate User Bio
 * @param {enum: ['Software Engineer', 'UX Designer']} role
 * @returns {String} uniquely generated personal bio
 */
export const generateBio = (role, location) => {

  const randomQuote = randQuote()

  return [
    `I'm a ${role} from ${location}.`,
    `${randomQuote}`,
    `I'm looking forward to using my skills to build something awesome.`
  ].join(' ');
};

/**
 * Generate Fake User
 * @param {enum: ['Software Engineer', 'UX Designer', 'Product Manager']} role
 * @returns a User object with randomly generated user data
 */
export const generateFakeUser = async (role, customInfo) => {

  const randomUser = randUser();

  const { firstName, lastName, email, address } = randomUser
  const location = address.country

  return {
    availability: {
      SUN: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      MON: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      TUE: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      WED: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      THU: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      FRI: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
      SAT: {
        available: true,
        availability: generateRealisticSingleDayAvailability(),
      },
    },
    bio: generateBio(role, location),
    email,
    firstName,
    lastName,
    links: {
      githubUrl: `www.github.com/${firstName}-${lastName}`,
      linkedinUrl: `www.linkedin.com/${firstName}-${lastName}`,
      portfolioUrl: `www.${firstName}${lastName}.com`,
    },
    passwordDigest: await bcrypt.hash('gumballs', 11),
    profilePicture: '',
    defaultProfilePicture: '',
    hasProfilePicture: false,
    project: null,
    role,
    timezone: '-8:00',
    verified: true,
    ...customInfo, // has to go last to overwrrite previous assignments
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
