import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getAllProjects,
  getOneProject,
  getTeamCommonAvailability,
  moveTicketColumn,
  reorderProjectColumn,
  updateProject,
  updateUserAndProject,
} from '../../controllers/project/projects.js';

const router = Router();

// TODO: when would the frontend need to getAllProjects?
router.get('/projects', getAllProjects);
router.get('/projects/:projectId', getOneProject);
// TODO: This route should be protected by BC ADMIN
router.post('/projects', createProject);

// TODO: Discuss during SWE meeting
// What elements of a project can be updated?
// Should they each have their own route? aka, meetings, chats, tasks etc.
// Yes IMO if it's a change to only one property to protect the rest of the
// record in case additional accidental data is submitted with this request
router.patch('/projects/:id', updateProject); //update description etc
router.delete('/projects/:id', deleteProject);
router.patch('/project/reorder/:projectId', reorderProjectColumn);
router.patch('/project/moveTicket/:projectId', moveTicketColumn);
router.patch('/update-user-and-project', updateUserAndProject);
router.get('/projects/:projectId/team-common-availability', getTeamCommonAvailability);

export default router;
