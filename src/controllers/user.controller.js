import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../models/User.model.js";
import sendOTPEmail from "../utils/sendEmail.js";
import passwordValid from "../utils/passwordValid.js";


const registerUser = async (req, res) => {
    try {
        const { name, userName, email, password, comfirmPassword } = req.body;

        if (!name || !userName || !email || !password || !comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUserName = await userModel.findOne({ userName });

        if (existingUserName) {
            return res.status(400).json({
                success: false,
                message: "Username already exists",
            });
        }

        const existingEmail = await userModel.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const passwordCheck = passwordValid(password);

        if (!passwordCheck.valid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }

        if (password !== comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not match.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            userName,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const user = await userModel.findOne({ userName });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }


       const token = jwt.sign(
            {
                userId: user._id,
                userName: user.userName,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const forgotPasswordUser = async (req, res) => {
    try {
        const { userName, email } = req.body;

        if (!userName || !email) {
            return res.status(400).json({
                success: false,
                message: "Username and email are required",
            });
        }

        const user = await userModel.findOne({
            userName,
            email,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Username or email is incorrect",
            });
        }
        
        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpExpires = new Date(
            Date.now() + 10 * 60 * 1000 //10mins
        );

        user.otp = otp;
        user.otpExpires = otpExpires;
        user.otpVerified = false;

        await user.save();

        await sendOTPEmail(user.email, otp);


        return res.status(200).json({
            success: true,
            message: "OTP sent to your registered email",
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const resetPasswordUser = async (req, res) => {
    try {
        const { password, newPassword, comfirmPassword } = req.body;

        if (!password || !newPassword || !comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Username, email and new password are required",
            });
        }

        const user = await userModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }

        if (password === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as your current password.",
            });
        }

        const passwordCheck = passwordValid(newPassword);

        if (!passwordCheck.valid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }


        if (newPassword !== comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not match.",
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const verifyOTP = async (req, res) => {
    try {

        const { userName, email, otp } = req.body;

        if (!userName || !email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Username, email and OTP are required",
            });
        }

        const user = await userModel.findOne({
            userName,
            email,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP.",
            });
        }

        if (new Date() > user.otpExpires) {

            user.otp = null;
            user.otpExpires = null;
            user.otpVerified = false;

            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP.",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        user.otpVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (error) {

        console.error("OTP verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const resetPasswordWithOTPUser = async (req, res) => {
    try {

        const { userName, email, newPassword, comfirmPassword } = req.body;

        if (!userName || !email || !newPassword || !comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await userModel.findOne({
            userName,
            email,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.otpVerified) {
            return res.status(401).json({
                success: false,
                message: "Please verify OTP first",
            });
        }

        const passwordCheck = passwordValid(newPassword);

        if (!passwordCheck.valid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }

        if (newPassword !== comfirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        user.otpVerified = false;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {

        console.error("Reset password error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export { loginUser, registerUser, forgotPasswordUser, resetPasswordUser, verifyOTP, resetPasswordWithOTPUser };