import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/functions/send-email";

export const auth = betterAuth({
    emailVerification: {
        sendVerificationEmail: async ({ url, user }) => {
            await sendEmail(url, user)
        }
    },
    emailAndPassword: { 
        enabled: true, 
        autoSignIn: false,
        requireEmailVerification: true,
    }, 
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
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
    plugins: [
      nextCookies(),
    ]
});