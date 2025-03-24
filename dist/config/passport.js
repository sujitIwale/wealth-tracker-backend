"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("../prisma"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id },
        });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
console.log(process.env.GOOGLE_CLIENT_ID || '', process.env.GOOGLE_CLIENT_SECRET || '', process.env.GOOGLE_CALLBACK_URL || '');
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { googleId: profile.id },
        });
        if (existingUser) {
            return done(null, existingUser);
        }
        // Create new user
        const newUser = await prisma_1.default.user.create({
            data: {
                googleId: profile.id,
                email: profile.emails?.[0].value || '',
                name: profile.displayName,
                profilePicture: profile.photos?.[0].value,
            },
        });
        return done(null, newUser);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;
