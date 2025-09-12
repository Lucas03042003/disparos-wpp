import { db } from "@/db";
import { sql } from "drizzle-orm";

async function dropTables() {
  await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "account" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "verification" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "fluxes" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "numbers" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "contacts" CASCADE;`);
}

dropTables().then(() => {
  console.log("Tabelas removidas!");
  process.exit(0);
});