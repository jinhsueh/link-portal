import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

// Keep migrations pointing at the SAME dev DB that the runtime uses.
// Runtime (src/lib/prisma.ts) reads DATABASE_URL which defaults to "file:./dev.db"
// (project root). Previously this config pointed migrations at prisma/dev.db,
// so `prisma migrate deploy` updated one file while the app read from another,
// causing schema drift (e.g. missing SocialLink.label column).
const devDbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : `file:${path.join(process.cwd(), "dev.db")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.TURSO_DATABASE_URL ?? devDbPath,
  },
});
