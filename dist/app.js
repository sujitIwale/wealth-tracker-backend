"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const platformsh_config_1 = __importDefault(require("platformsh-config"));
const passport_1 = __importDefault(require("./config/passport"));
const expense_1 = __importDefault(require("./routes/expense"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const income_1 = __importDefault(require("./routes/income"));
const port = process.env.PORT || 3001;
const app = (0, express_1.default)();
const config = platformsh_config_1.default.config();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow cookies to be sent with requests
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Set up session middleware
app.use((0, express_session_1.default)({
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
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/", (req, res) => {
    res.send("Welcome to the wealth ai api " + req.url);
});
// Routes
app.use("/auth", auth_1.default);
app.use("/user", auth_2.authenticateJWT, user_1.default);
app.use("/expense", auth_2.authenticateJWT, expense_1.default);
app.use("/income", auth_2.authenticateJWT, income_1.default);
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
