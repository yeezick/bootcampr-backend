import { Router } from "express";
import * as controllers from "../controllers/users.js";
// import restrict from '../helpers/restrict.js'

const router = Router();

// standard crud
router.get("/users", controllers.getAllUsers);
router.get('/users/:id', controllers.getOneUser);
router.post("/sign-up", controllers.signUp);
router.put("/users/:id", controllers.updateUserInfo);
router.patch('/users/:id', controllers.addPortfolioProject);
router.delete('/users/:id', controllers.deleteUser);

// auth
router.post("/sign-in", controllers.signIn);
router.get("/verify", controllers.verify);
router.post("/email", controllers.checkEmail)
router.post('/confirm-password/:userID', controllers.confirmPassword);
router.patch('/update-password/:userID', controllers.updatePassword);


export default router;
