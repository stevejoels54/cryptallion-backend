import express from "express";
import UsersController from "../controllers/UsersController";
import TransactionsController from "../controllers/TransactionsController";
import DashboardController from "../controllers/DashBoardController";
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

// transactions routes
router.post(
  `${prefix}/transactions`,
  AuthMiddleware.authenticate,
  TransactionsController.createTransaction
);
router.get(
  `${prefix}/transactions`,
  AuthMiddleware.authenticate,
  TransactionsController.getTransactions
);
router.get(
  `${prefix}/transactions/:id`,
  AuthMiddleware.authenticate,
  TransactionsController.getTransaction
);
router.put(
  `${prefix}/transactions/:id`,
  AuthMiddleware.authenticate,
  TransactionsController.updateTransaction
);
router.delete(
  `${prefix}/transactions/:id`,
  AuthMiddleware.authenticate,
  TransactionsController.deleteTransaction
);

// dashboard routes
router.get(
  `${prefix}/dashboard`,
  AuthMiddleware.authenticate,
  DashboardController.getChartData
);

export default router;
