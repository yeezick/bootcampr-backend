import { generateFakeUser } from '../seed/utils/users.js';
import {
  applePieData,
  laterGatorData,
  sillyGooseData,
  starStruckData,
  pollyProductData,
  functionalDevData,
} from './mocks/users.js';
import { generateProject } from '../helpers/projects.js';
import { generateDayJs } from '../../globals.js';
import { generateHexadecimal } from '../helpers/utilityFunctions.js';

export const defaultProject = {
  title: 'Travel Troubles',
  goal: 'Design & ship a responsive website.',
  problem: 'How might we connect people with similar travel plans/interests?',
  duration: 27,
};
// can this be run within server.js so it only has to run once vs. run on every execution of getOneProejct?
export const generateSandboxProjectData = async () => {
  const sandboxId = 'sandbox';
  const staticProject = await generateProject();
  const starStruck = await generateFakeUser('UX Designer', { ...starStruckData, _id: 'starStruck' }, sandboxId);
  const sillyGoose = await generateFakeUser('UX Designer', { ...sillyGooseData, _id: 'sillyGoose' }, sandboxId);
  const laterGator = await generateFakeUser('Software Engineer', { ...laterGatorData, _id: 'laterGator' }, sandboxId);
  const applePie = await generateFakeUser('Software Engineer', { ...applePieData, _id: 'applePie' }, sandboxId);
  const functionalDev = await generateFakeUser(
    'Software Engineer',
    { ...functionalDevData, _id: 'functionalDev' },
    sandboxId,
  );
  const pollyProduct = await generateFakeUser(
    'Product Manager',
    { ...pollyProductData, _id: 'pollyProduct' },
    sandboxId,
  );

  const createdAtDate = generateDayJs().format();
  const sampleTicket = {
    _id: generateHexadecimal(),
    description: 'Sample description',
    comments: [],
    createdBy: 'starStruck',
    projectId: 'sandbox',
    status: 'toDo',
    title: 'Sample title',
    createdAt: createdAtDate,
    updatedAt: createdAtDate,
    __v: 0,
  };

  staticProject._id = sandboxId;
  staticProject.calendarId = 'sandbox';
  staticProject.members.designers = [starStruck, sillyGoose];
  staticProject.members.engineers = [functionalDev, laterGator, applePie];
  staticProject.members.productManagers = [pollyProduct];
  staticProject.projectTracker.toDo = [sampleTicket];

  return staticProject;
};
