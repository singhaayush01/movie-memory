import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Prisma CLI commands and migrations should use Neon's direct connection.
    url: env("DIRECT_URL")
  }
});
