import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import Database from "bun:sqlite";
import { Elysia } from "elysia";
import setupDatabase from "./setup";
import { startup } from "./startup";
import { databasePath } from "./utils";

if (!(await Bun.file(databasePath).exists())) await setupDatabase();

await startup();

// db should be ready
const db = new Database(databasePath);

const corsOrigin = process.env.CORS_ORIGIN || "*"; // Default to allow all origins

const app = new Elysia()
  .use(cors({ origin: corsOrigin }))
  .use(
    swagger({
      documentation: {
        info: {
          title: "Toby API",
          description: "API documentation for Toby",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/", () => "Hello Elysia and Penticton Robotics!")
  .get("/favicon.ico", () => Bun.file("./assets/favicon.ico"))

  .listen(3460);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

export type TobyAPI = typeof app;
