import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import pConfig from "platformsh-config";
import passport from "./config/passport";
import expenseRouter from "./routes/expense";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { authenticateJWT } from "./middleware/auth";
import incomeRouter from "./routes/income";

const port = process.env.PORT || 3001;
const app = express();

const config = pConfig.config();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow cookies to be sent with requests
}));

app.use(express.json());
app.use(cookieParser());

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRouter);
app.use("/user",authenticateJWT, userRouter);
app.use("/expense",authenticateJWT, expenseRouter);
app.use("/income",authenticateJWT, incomeRouter);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
