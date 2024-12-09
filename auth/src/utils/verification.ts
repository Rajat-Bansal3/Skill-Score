import crypto from "crypto";

export async function generateVerificationCode(user: any) {
  const verificationCode = crypto.randomBytes(16).toString("hex");
  user.verificationCode = verificationCode;
  user.verificationCodeExpiry = new Date(Date.now() + 6 * 60 * 1000);
  await user.save();
}
