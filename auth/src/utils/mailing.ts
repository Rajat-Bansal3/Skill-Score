import Nodemailer from "nodemailer";
import { env } from "../types/env";

const transport = Nodemailer.createTransport({
  host: env.MAILTRAP_STMP_SIG,
  port: 2525,
  secure: false,
  auth: {
    user: env.MAIL_TRAP_USER_ID,
    pass: env.MAIL_TRAP_PASSWORD,
  },
});

const sender = {
  address: "login@skill_score.com",
  name: "Skill Score",
};

export const sendMail = async (recipients: string, url: string) => {
  const emailContent = `
    <html>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 20px;">
      <tr>
        <td>
          <div style="max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333333; text-align: center;">Welcome to Skill Score!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555555;">Hi there,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #555555;">
              We're excited to have you join our platform. To complete your registration and verify your email address, please click the link below:
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${url}" style="font-size: 18px; padding: 10px 20px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Your Email</a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-top: 20px;">
              If you did not sign up for Skill Score, please ignore this email.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #555555;">Thank you,<br/>The Skill Score Team</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>

  `;

  try {
    const info = await transport.sendMail({
      from: sender,
      to: recipients,
      subject: "Welcome to Skill Score! Verify Your Email Now.",
      text: `Click on the link to verify your email: ${url}`,
      html: emailContent,
    });
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
