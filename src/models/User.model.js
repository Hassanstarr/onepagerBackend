import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        userName: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            default: null
        },

        otpExpires: {
            type: Date,
            default: null
        },

        otpVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;