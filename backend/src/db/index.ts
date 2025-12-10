import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const client = new SQL(process.env.DATABASE_URL!);
const db = drizzle({ client, schema });

export default db;
