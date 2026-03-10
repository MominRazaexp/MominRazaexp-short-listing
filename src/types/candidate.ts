export type CandidateProfile = {
  source?: string;
  jobTitle?: string;
  jobLocation?: string;
  fullApplicationUrl?: string;
  availability?: string;
  interviewAvailability?: string;
  screenerQA?: { question: string; answer: string } | null;
  saferedirectUrl?: string;
  resumeUrl?: string;
  cvLink?: string;
  applied_role?: string;
  resumeText?: string;
  age?: string;
  candidate_name?: string;
  candidate_email?: string;
};

export type Candidate = {
  _id: string;
  candidate_name: string;
  candidate_email: string;
  applied_role: string;
  jobTitle: string;
  source: string;
  score: any;
  profile: any;
  shortlisted: boolean;
  createdAt: string;
};