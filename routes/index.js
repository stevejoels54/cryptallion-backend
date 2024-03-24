import express from "express";
import UsersController from "../controllers/UsersController";
import OtpController from "../controllers/OtpController";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = express.Router();
const prefix = "/api/v1";

// auth routes
router.post(`${prefix}/auth/register`, UsersController.signUp);
router.post(`${prefix}/auth/login`, UsersController.logIn);
router.get(
  `${prefix}/auth/me`,
  AuthMiddleware.authenticate,
  UsersController.getUser
);
router.get(`${prefix}/auth/logout`, UsersController.logOut);

// send otp route
router.post(`${prefix}/auth/otp`, OtpController.sendOtp);

export default router;
