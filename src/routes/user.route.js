import express from "express";
import { loginUser, registerUser, forgotPasswordUser, resetPasswordUser, verifyOTP, resetPasswordWithOTPUser } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.post("/reset-password", authMiddleware, resetPasswordUser);
userRouter.post("/forgot-password", forgotPasswordUser);
userRouter.post("/otp", verifyOTP);
userRouter.post("/reset-password-otp", resetPasswordWithOTPUser);

export default userRouter;