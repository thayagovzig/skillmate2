import express from "express";
import {config} from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from './routes/userRouter.js';

const app = express();
config({path: "./config/config.env"});

app.use(
    cors({
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

// Mock data for universities
const universities = [
    { id: 1, name: 'Harvard University' },
    { id: 2, name: 'Stanford University' },
    { id: 3, name: 'Massachusetts Institute of Technology' },
    { id: 4, name: 'University of Oxford' },
    { id: 5, name: 'California Institute of Technology' }
];

// Route to get universities
app.get('/api/v1/university', (req, res) => {
    res.json(universities);
});

app.use("/api/v1/user", userRouter);

dbConnection();

app.use(errorMiddleware);
export default app;