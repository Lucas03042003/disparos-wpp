import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"
import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "@/functions/send-email";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-10-29.clover", // Latest API version as of Stripe SDK v19
})

export const auth = betterAuth({
    emailVerification: {
        sendVerificationEmail: async ({ url, user }) => {
            await sendEmail(url, user, "verify_email")
        }
    },
    emailAndPassword: { 
        enabled: true, 
        autoSignIn: false,
        requireEmailVerification: true,
        sendResetPassword: async ({user, url}) => {
          await sendEmail(url, user, "reset_password")
        },
    }, 
    socialProviders: {
      google: {
        prompt: "select_account", 
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
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                authorizeReference: async (data) => {
                    return data.user.id === data.referenceId;
                },
                plans: [
                    // {
                    //     name: "Free Trial",
                    //     priceId: "price_1SSId9POrjfEl65X7TXk1beH",
                    //     limits: {
                    //         numbers: 1
                    //     }
                    // },
                    {
                        name: "Basic",
                        priceId: "price_1SSFiwPOrjfEl65XGUA3UFPu",
                        limits: {
                            numbers: 2,
                        }
                    },
                    {
                        name: "Premium",
                        priceId: "price_1SSFjgPOrjfEl65XOc8fOlAt",
                        limits: {
                            numbers: 5,
                        }
                    }
                ]
            }
        })

    ]
});