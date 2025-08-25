import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // ensures environment vars load

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts", // path to your Drizzle schema
  out: "./drizzle", // migrations folder
  dbCredentials: {
    url: process.env.DATABASE_URL!, // reading from .env.local
  },
  verbose: true, // optional: log every query
});
