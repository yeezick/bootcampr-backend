import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getAllProjects,
  getOneProject,
  getUserProjects,
  updateProject,
  updateUserAndProject,
} from '../controllers/projects.js';

const router = Router();
// standard crud
// when would the frontend need to getAllProjects?
router.get('/projects', getAllProjects);
router.get('/projects/:id', getOneProject);
// This route should be protected by BC ADMIN
router.post('/projects', createProject);
router.get('/users/projects/:userId', getUserProjects);
// what elements of a project can be updated?
// should they each have their own route? aka, meetings, chats, tasks etc.
router.put('/projects/:id', updateProject); //update description etc
router.delete('/projects/:id', deleteProject);

// special endpoints
router.patch('/update-user-and-project', updateUserAndProject);
// router.put(
//   "/projects/:projectId/remove-member",
//   controllers.removeMemberFromProject
// );
// router.put(
//   "/projects/:projectId/add-interested-user",
//   controllers.addInterestedUser
// );
// router.put(
//   "/projects/:projectId/remove-interested-user",
//   controllers.removeInterestedUser
// );

export default router;
