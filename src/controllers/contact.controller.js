import contactModel from "../models/Contact.model.js";

const createContact = async (req, res) => {
    try {
        const { name, email, website, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required",
            });
        }

        const contact = await contactModel.create({
            name,
            email,
            website,
            message,
        });

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                website: contact.website,
                message: contact.message,
                createdAt: contact.createdAt,
            },
        });

    } catch (error) {
        console.error("Contact error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { createContact };