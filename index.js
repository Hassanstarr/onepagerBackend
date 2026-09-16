import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./src/config/mongodb.js";

import userRouter from "./src/routes/user.route.js";
import contactRouter from "./src/routes/contact.route.js";


const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/user', userRouter);
app.use('/api/contact', contactRouter);

app.use('/api', (req, res) => {
    res.send('Welcome to the Home Page!');
    console.log('API route accessed', process.env.PORT);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log("Server running on PORT", PORT);
})