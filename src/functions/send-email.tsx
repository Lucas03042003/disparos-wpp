import { Resend } from "resend";
import { Session } from "../lib/auth-client";
import VerficationEmailTemplate from "../mails/verification-template";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEmail = async (url:string, user:Session) => {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: ["delivered@resend.dev"],
        subject: "Verify your email",
        react: VerficationEmailTemplate({ url, name: user.name }),
    });
};