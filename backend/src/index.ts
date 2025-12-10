import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { betterAuthView } from "./auth";

const corsOrigin = process.env.CORS_ORIGIN || "*"; // Default to allow all origins

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Catclash API",
          description: "API documentation for Catclash",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/", () => "Hello Elysia and Catclash!")
  .get("/favicon.ico", () => Bun.file("./assets/favicon.ico"))

  .all("/api/auth/*", betterAuthView)

  .listen(process.env.PORT ?? 3463);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

export type CatclashAPI = typeof app;
