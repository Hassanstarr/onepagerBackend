import express from "express";
import { loginUser, registerUser, forgotPasswordUser, resetPasswordUser } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.post("/forgot-password", forgotPasswordUser);
userRouter.post("/reset-password", authMiddleware, resetPasswordUser);

export default userRouter;