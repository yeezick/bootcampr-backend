import { Router } from "express";
import * as controllers from "../controllers/projects.js";

const router = Router();
// standard crud
router.get("/projects", controllers.getAllProjects);
router.get("/projects/:id", controllers.getOneProject);
router.post("/projects", controllers.createProject);
router.put("/projects/:id", controllers.updateProject); //update description etc
router.delete("/projects/:id", controllers.deleteProject);

// special endpoints
router.patch("/update-user-and-project", controllers.updateUserAndProject);
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
