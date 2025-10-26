import { Resend } from "resend";
import { Session } from "../lib/auth-client";
import VerficationEmailTemplate from "../mails/verification-template";
import PasswordResetEmail from "../mails/password-reset-template";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEmail = async (url:string, user:Session, type:string) => {
    
    let subject = "Verify your email";
    let react = VerficationEmailTemplate({ url, name: user.name! });
    
    if (type === "reset_password") {
        subject = "Reset your password";
        react = PasswordResetEmail({ url, name: user.name! });
    }
    
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: ["delivered@resend.dev"],
        subject: subject,
        react: react,
    });
};