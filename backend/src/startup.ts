import { Database } from "bun:sqlite";

import { databasePath } from "./utils";

export async function startup() {
  console.log("Starting up TobyAPI...");

  const db = new Database(databasePath);
}
