import crypto from "crypto";

export const generateOtp = (username: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  const otpExpiry = Date.now() + 6 * 60 * 1000;
  return {
    otp,
    otpExpiry,
  };
};
