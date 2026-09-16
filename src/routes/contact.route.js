import express from "express";
import { createContact } from "../controllers/contact.controller.js";

const contactRouter = express.Router();

contactRouter.post("/", createContact);

export default contactRouter;