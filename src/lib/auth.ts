import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
    emailAndPassword: { 
        enabled: true, 
    }, 
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    user: {
        modelName: "userTable",
    },
    session: {
        modelName: "sessionTable"
    },
    account: {
        modelName: "accountTable"
    },
    verification: {
        modelName: "verificationTable",
    },
});