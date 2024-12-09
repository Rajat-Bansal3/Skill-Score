import mongoose from "mongoose";
import {
  emailRegex,
  IRoom,
  IUser,
  phoneRegex,
  profileImageRegex,
  usernameRegex,
} from "./types/types";

export const createModels = (mongooseInstance: typeof mongoose) => {
  const RoomSchema = new mongooseInstance.Schema<IRoom>(
    {
      name: {
        type: String,
        required: [true, "Tournament name is required"],
        minlength: [3, "Tournament name must be at least 3 characters long"],
        maxlength: [50, "Tournament name must be at most 50 characters long"],
        match: [
          /^[A-Za-z0-9_ ]+$/,
          "Tournament name can only contain letters, numbers, spaces, and underscores",
        ],
        trim: true,
      },
      state: {
        type: String,
        enum: ["ACTIVE", "WAITING", "FINISHED", "UPCOMING"],
        default: "WAITING",
        required: true,
      },
      maxMembers: {
        type: Number,
        min: [1, "Tournament must have at least one participant"],
        max: [1000, "Tournament cannot have more than 1000 participants"],
        default: 100,
      },
      currentUsers: {
        type: [String],
        default: [],
        validate: {
          validator: function (users: string[]) {
            return users.every((user) => /^[a-f\d]{24}$/i.test(user));
          },
          message: "Invalid user ID in currentUsers",
        },
      },
      expiresAt: {
        type: Date,
        required: false,
        validate: {
          validator: function (value: Date) {
            return value > new Date();
          },
          message: "Expiration date must be in the future",
        },
      },
      winner: {
        type: String,
        ref: "User",
        validate: {
          validator: function (value: string) {
            return /^[a-f\d]{24}$/i.test(value);
          },
          message: "Invalid user ID for winner",
        },
      },
      owner: {
        type: String,
        ref: "User",
        required: [true, "Owner is required"],
        validate: {
          validator: function (value: string) {
            return /^[a-f\d]{24}$/i.test(value);
          },
          message: "Invalid user ID for owner",
        },
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard", "extreme"],
        default: "easy",
        required: true,
      },
      maxWinning: {
        type: Number,
        min: [0, "Max winning must be at least 0"],
        default: 0,
      },
      minWinning: {
        type: Number,
        min: [0, "Min winning must be at least 0"],
        default: 0,
        validate: {
          validator: function (value: number, context) {
            return this.maxWinning >= value;
          },
          message: "Min winning must be less than or equal to max winning",
        },
      },
      gameType: {
        type: String,
        required: [true, "Game type is required"],
        enum: {
          values: ["Blitz", "Bullet", "Rapid"],
          message:
            "Invalid game type. Allowed values are Blitz, Bullet, and Rapid",
        },
        default: "Rapid",
      },
      entryFee: {
        type: Number,
        min: [0, "Entry fee cannot be negative"],
        default: 0,
      },
      rules: {
        type: String,
        maxlength: [1000, "Rules cannot exceed 1000 characters"],
        default: "",
      },
      startTime: {
        type: Date,
        required: [true, "Start time is required"],
        validate: {
          validator: function (value: Date) {
            return value > new Date();
          },
          message: "Start time must be in the future",
        },
      },
      endTime: {
        type: Date,
        required: [true, "End time is required"],
        validate: {
          validator: function (value: Date, context) {
            return this.startTime ? value > this.startTime : false;
          },
          message: "End time must be after the start time",
        },
      },
      scoringSystem: {
        type: String,
        enum: {
          values: ["points", "time", "kills"],
          message:
            "Invalid scoring system. Allowed values are points, time, and kills",
        },
        default: "points",
      },
      sponsors: {
        type: [
          {
            name: {
              type: String,
              required: [true, "Sponsor name is required"],
              minlength: [3, "Sponsor name must be at least 3 characters long"],
              maxlength: [
                50,
                "Sponsor name must be at most 50 characters long",
              ],
            },
            logo: {
              type: String,
              validate: {
                validator: function (value: string) {
                  return /^https?:\/\/.+\.(jpg|jpeg|png|svg|webp)$/.test(value);
                },
                message: "Sponsor logo must be a valid image URL",
              },
            },
            website: {
              type: String,
              validate: {
                validator: function (value: string) {
                  return /^https?:\/\/.+$/.test(value);
                },
                message: "Sponsor website must be a valid URL",
              },
            },
          },
        ],
        default: [],
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      priority: {
        type: Number,
        default: 0,
        validate: {
          validator: function (value: number) {
            return value >= 0;
          },
          message: "Priority must be a non-negative number",
        },
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        transform: (_, ret) => {
          delete ret.__v;
          return ret;
        },
      },
    }
  );

  RoomSchema.index({ name: 1 }, { unique: true });
  RoomSchema.index({ difficulty: 1 });
  RoomSchema.index({ gameType: 1 });

  const UserSchema = new mongooseInstance.Schema<IUser>(
    {
      username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [64, "Username must not exceed 64 characters"],
        match: [
          usernameRegex,
          "Username can only contain letters, numbers, and underscores",
        ],
        validate: {
          validator: (v: string) => usernameRegex.test(v),
          message: "Invalid username format",
        },
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [emailRegex, "Invalid email address format"],
        validate: {
          validator: (v: string) => emailRegex.test(v),
          message: "Invalid email address",
        },
      },
      tournament: {
        type: String,
        validate: {
          validator: (v: string) =>
            typeof v === "string" && v.trim().length > 0,
          message: "Invalid tournament name",
        },
      },
      passwordHash: {
        type: String,
        required: [true, "Password hash is required"],
        validate: {
          validator: (v: string) => v.length > 0,
          message: "Password hash cannot be empty",
        },
      },
      phone: {
        type: String,
        unique: true,
        sparse: true,
        match: [
          phoneRegex,
          "Phone number must have 10 digits and not start with zero",
        ],
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      isPhoneVerified: {
        type: Boolean,
        default: false,
      },
      roles: {
        type: [String],
        default: ["user"],
        validate: {
          validator: (roles: string[]) =>
            Array.isArray(roles) && roles.length > 0,
          message: "Roles must be valid and contain at least one role",
        },
      },
      lastLogin: {
        type: Date,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
      profileImage: {
        type: String,
        match: [profileImageRegex, "Invalid profile image URL"],
        validate: {
          validator: (v: string) => profileImageRegex.test(v),
          message: "Invalid image format",
        },
      },
      status: {
        type: String,
        enum: ["active", "banned", "suspended"],
        default: "active",
        required: [true, "User status is required"],
      },
      verificationCode: {
        type: String,
        sparse: true,
      },
      verificationCodeExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 6 * 60 * 1000),
        validate: {
          validator: (v: Date) => v.getTime() > Date.now(),
          message: "Verification code expiry must be a valid future date",
        },
      },
      otp: {
        type: Number,
        sparse: true,
        validate: {
          validator: (v: number) => typeof v === "number" && v > 0,
          message: "OTP must be a valid number greater than 0",
        },
      },
      otpExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 6 * 60 * 1000),
        validate: {
          validator: (v: Date) => v.getTime() > Date.now(),
          message: "OTP expiry must be a valid future date",
        },
      },
    },
    { timestamps: true }
  );
  UserSchema.index({ email: 1 }, { unique: true });
  UserSchema.index({ username: 1 }, { unique: true });
  const Room = mongooseInstance.model<IRoom>("Room", RoomSchema);
  const User = mongooseInstance.model<IUser>("User", UserSchema);
  return { User, Room };
};
