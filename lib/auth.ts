import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.AUTH_SECRET!,
  trustedOrigins: ["http://localhost:3000"],
  advanced: {
    database: {
      generateId: false,
    },
  },
});
