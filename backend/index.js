import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes("vercel.app") || origin.includes("localhost")) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}));
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});