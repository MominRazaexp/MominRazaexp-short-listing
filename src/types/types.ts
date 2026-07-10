import { Candidate } from "@/types/candidate";
export type PubSubPushBody = {
  message?: { data?: string; messageId?: string; attributes?: Record<string, string> };
  subscription?: string;
};

export type SideBarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export type CandidateModalProps = {
  candidate: Candidate;
  onClose: () => void;
};

export type FormResponse = {
  question: string;
  answer: string;
  description?: string;
};