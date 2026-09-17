import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/User.model.js";

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

        if(password.length < 8){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            })
        }

        if(!/[A-Z]/.test(password)){
            return res.status(400).json({
                success: false,
                message: "Password must contain at least one uppercase character."
            })
        }

        if(!/[a-z]/.test(password)){
            return res.status(400).json({
                success: false,
                message: "Password must contain at least one lowercase character,"
            })
        }

        if(!/[0-9]/.test(password)){
            return res.status(400).json({
                success: false,
                message: "Passowrd must contain at least one number."
            })
        }

        if(!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(password)){
            return res.status(400).json({
                success: false,
                message: "Password must contain at least one special character"
            })
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

        return res.status(200).json({
            success: true,
            message: "Username and email verified",
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


export { loginUser, registerUser, forgotPasswordUser, resetPasswordUser };