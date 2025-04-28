// this is inside the generated folder automatically created by prisma when we ran 'npx prisma generate' command
import { PrismaClient } from "../generated/prisma/index.js";

// initialised 'globalThis' object
const globalForPrisma = globalThis;

// if the 'globalThis' object has a property 'prisma' then use it otherwise initialise a new instance of 'PrismaClient'
export const db = globalForPrisma.prisma || new PrismaClient();

// if we aren't in production environment then put the prisma in db
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;