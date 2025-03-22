import { User as PrismaUser } from '@prisma/client';

// Extend the Express Request type to include the user property
declare global {
    namespace Express {
      interface User extends PrismaUser {}
    }
}