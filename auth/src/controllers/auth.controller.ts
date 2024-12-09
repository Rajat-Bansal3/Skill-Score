import { Request, Response, NextFunction, response } from "express";
import { createModels } from "@skill_score/shared";
import { errorHandler, SuccessHandler } from "../types/resposneHandlers";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/mailing";
import { env } from "../types/env";
import UserSchema from "../types/types";
import { sendVerificationSMS } from "../utils/sms";
import { generateOtp } from "../utils/func";
import jwt from "jsonwebtoken";
import fs from "fs";
import mongoose from "mongoose";

const { User } = createModels(mongoose);

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code } = req.query;
  if (!code) errorHandler(res, "NOT_FOUND", "Verification code needed", 404);
  try {
    const user = await User.findOne({ verificationCode: code });
    if (!user)
      return errorHandler(
        res,
        "INVALID_VERIFICATION_CODE",
        "varification code not valid or is expired",
        400
      );
    if (
      (user.verificationCodeExpiry &&
        user.verificationCodeExpiry.getTime() < Date.now()) ||
      user.verificationCode !== code
    ) {
      return errorHandler(
        res,
        "INVALID_VERIFICATION_CODE",
        "verification code is expired or invalid",
        400
      );
    }
    user.isEmailVerified = true;
    user.save();
    return SuccessHandler(res, "user verified successfully", null);
  } catch (error) {
    next(error);
  }
};
export const verifyPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone, code } = req.query;
  try {
    const user = await User.findOne({ phone });
    if (!user)
      return errorHandler(
        res,
        "INVALID_PHONE_NUMBER",
        "user with given phone number not found",
        404
      );
    if (
      (user.otpExpiry && user.otpExpiry.getTime() < Date.now()) ||
      Number(user.otp) !== Number(code)
    )
      return errorHandler(res, "INVALID_OTP", "otp invalid or expired", 401);
    user.isPhoneVerified = true;
    await user.save();
    SuccessHandler(res, "Phone Number Verified", null);
  } catch (error) {
    next(error);
  }
};
export const test = (req: Request, res: Response, next: NextFunction) => {
  res.send("test");
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = UserSchema.safeParse(req.body);
  if (user.error) {
    return errorHandler(res, "INVALID_FORMAT", user.error.toString(), 400);
  }
  const { username, password, email, phone } = user.data;

  try {
    const user = await User.findOne({ email });
    if (user)
      return errorHandler(
        res,
        "Email Already Registered",
        "EMAIL_ALREADY_IN_USE",
        409
      );
    const hashedPass = bcrypt.hashSync(password, 10);
    const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?code=${randomCode}`;
    const { otp, otpExpiry } = generateOtp(username);
    const newUser = new User({
      username,
      email,
      phone,
      otp,
      otpExpiry,
      passwordHash: hashedPass,
      verificationCode: randomCode,
      verificationCodeExpiry: Date.now() + 6 * 60 * 1000,
    });
    await newUser.save();
    await sendMail(email, verificationUrl);
    await sendVerificationSMS(phone, otp);
    return SuccessHandler(res, "Successfully Registered User", user);
  } catch (error) {
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = UserSchema.safeParse(req.body);
  if (payload.error)
    return errorHandler(res, "INVALID_FORMATE", payload.error.toString(), 400);
  const { email, password } = payload.data;
  try {
    console.log(payload);
    const user = await User.findOne({ email });
    if (!user)
      return errorHandler(
        res,
        "EMAIL_ID_DOESNT_EXISTS",
        "Invalid Credentials",
        403
      );
    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid)
      return errorHandler(res, "WRONG_PASSWORD", "invalid credentials", 403);
    const privateKey = fs.readFileSync(env.KEY_PATH!, "utf-8");
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.roles },
      privateKey,
      {
        algorithm: "PS384",
      }
    );
    return SuccessHandler(res, "Successfully signed in", { token, user });
  } catch (error) {
    next(error);
  }
};
