import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../prisma';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            googleId: profile.id,
            email: profile.emails?.[0].value || '',
            name: profile.displayName,
            profilePicture: profile.photos?.[0].value,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport; 