import mongoose, { Schema } from "mongoose";

const CandidateResultSchema = new Schema(
  {
    candidate_name: { type: String, index: true },
    candidate_email: { type: String, index: true },
    source: String,
    jobTitle: String,
    applied_role: String,

    emailMessageId: { type: String, unique: true, index: true },
    resumeFileName: String,

    profile: { type: Object, required: true }, 
    score: { type: Object, required: true },  

    shortlisted: { type: Boolean, index: true },
  },
  { timestamps: true }
);

export const CandidateResult =
  mongoose.models.CandidateResult ||
  mongoose.model("CandidateResult", CandidateResultSchema);
