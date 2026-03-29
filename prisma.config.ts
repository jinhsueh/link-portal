import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  },
});
