//@ts-nocheck
import { env } from "process";
import textflow from "textflow.js";
textflow.useKey(env.TEXT_FLOW_API_KEY);
export const sendVerificationSMS = async (phoneNumber, verificationOptions) => {
  try {
    const response = await textflow.sendVerificationSMS(
      `+91${phoneNumber}`,
      verificationOptions
    );
    console.log("Verification SMS sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending verification SMS:", error);
    throw error;
  }
};
