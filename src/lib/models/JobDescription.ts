import mongoose from "mongoose";

const JobDescriptionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    keywords: {
      type: [String],
      required: true,
      default: [],
    },

    jd: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const JobDescription =
  mongoose.models.JobDescription ||
  mongoose.model("JobDescription", JobDescriptionSchema);