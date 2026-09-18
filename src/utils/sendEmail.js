import nodemailer from "nodemailer";

const sendOTPEmail = async (email, otp) => {
    console.log("📧 [Nodemailer] Creating transporter...");
    console.log("📧 [Nodemailer] EMAIL_USER exists:", !!process.env.EMAIL_USER);
    console.log("📧 [Nodemailer] EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}. This OTP will expire in 10 minutes.`,
    };

    try {
        console.log("📧 [Nodemailer] Attempting to send mail to:", !!email ? "Valid Email Provided" : "Missing Email");
        const info = await transporter.sendMail(mailOptions);
        console.log("📧 [Nodemailer] Email sent successfully. MessageId:", info.messageId);
        return info;
    } catch (error) {
        console.error("📧 [Nodemailer] Error sending email!");
        console.error("   Message:", error.message);
        console.error("   Code:", error.code);
        console.error("   Command:", error.command);
        console.error("   Response:", error.response);
        console.error("   ResponseCode:", error.responseCode);
        
        // Re-throw to be caught by the controller
        throw error;
    }
};

export default sendOTPEmail;