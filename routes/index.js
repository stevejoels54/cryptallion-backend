import express from "express";
import UsersController from "../controllers/UsersController";

const router = express.Router();
const prefix = "/api/v1";

// auth routes
router.post(`${prefix}/auth/register`, UsersController.signUp);
router.post(`${prefix}/auth/login`, UsersController.logIn);
router.get(`${prefix}/auth/me`, UsersController.getUser);
router.get(`${prefix}/auth/logout`, UsersController.logOut);

export default router;
