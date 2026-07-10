"use client";
import { CandidateModalProps } from "@/types/types";
import {
  Mail, User, Briefcase, Star, CheckCircle,
  Building2, Link, GraduationCap,
  Layers, Wrench, Github, ExternalLink,
  HelpCircle, Sparkles, X, FileUser,
  Check,
  MailOpen,
  MapPin,
  Phone
} from "lucide-react";
import modalStyles from "./candidateModal.module.css";

export default function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>

        <div className={modalStyles.modalHeader}>
          <div className={modalStyles.modalAvatar}>
            {getInitials(candidate.candidate_name)}
          </div>
          <div className={modalStyles.modalTitleBlock}>
            <h2 className={modalStyles.modalName}>{candidate.candidate_name}</h2>
            <div className={modalStyles.modalSubtitle}>{candidate.applied_role}</div>
          </div>
          <div className={modalStyles.scoreChip}>
            <div>
              <div className={modalStyles.scoreLabel}>Score</div>
              <div className={modalStyles.scoreNumber}>{candidate.score?.match_score ?? 0}%</div>
            </div>
          </div>
          <button className={modalStyles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={modalStyles.modalBody}>

          <div className={modalStyles.section}>
            <h3 className={modalStyles.sectionTitle}>
              <User size={14} /> Candidate Info
            </h3>
            <div className={modalStyles.infoGrid}>
              <div className={modalStyles.infoItem}>
                <Mail size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Email</span>
                  <span className={modalStyles.infoValue}>{candidate.candidate_email}</span>
                </div>
              </div>
              <div className={modalStyles.infoItem}>
                <Phone size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Phone</span>
                  <span className={modalStyles.infoValue}>
                    {candidate.score?.candidate_phone || "Not Provided"}
                  </span>
                </div>
              </div>
              <div className={modalStyles.infoItem}>
                <Briefcase size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Applied Role</span>
                  <span className={modalStyles.infoValue}>{candidate.applied_role}</span>
                </div>
              </div>
              <div className={modalStyles.infoItem}>
                <Building2 size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Job Title</span>
                  <span className={modalStyles.infoValue}>{candidate.jobTitle.replace(/&amp;/g, "&")}</span>
                </div>
              </div>
              <div className={modalStyles.infoItem}>
                <Link size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Source</span>
                  <span className={modalStyles.infoValue}>{candidate.source}</span>
                </div>
              </div>
              {candidate.score?.candidate_location && <div className={modalStyles.infoItem}>
                <MapPin size={16} />
              <div>
                <span className={modalStyles.infoLabel}>Location</span>
                 <span className={modalStyles.infoValue}>
                    {candidate.score.candidate_location}
                 </span>
               </div>
              </div>} 
              <div className={modalStyles.infoItem}>
                <CheckCircle size={16} />
                <div>
                  <span className={modalStyles.infoLabel}>Status</span>
                  <span className={`${modalStyles.infoValue} ${candidate.shortlisted ? modalStyles.statusShortlisted : modalStyles.statusRejected}`}>
                    {candidate.shortlisted ? <><Check size={13} /> Shortlisted</> : <><X size={13} /> Rejected</>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={modalStyles.section}>
            <h3 className={modalStyles.sectionTitle}><Star size={14} /> AI Score & Recommendation</h3>
            <div className={modalStyles.scoreGrid}>
              <p className={modalStyles.scoreText}><b>Match Score:</b> {candidate.score?.match_score}</p>
              <p className={modalStyles.scoreText}><b>Recommendation:</b> {candidate.score?.recommendation}</p>
              <p className={modalStyles.scoreText}><b>Reasoning:</b> {candidate.score?.reasoning}</p>
            </div>
          </div>

          {candidate.score?.highlights?.length > 0 && (
            <div className={modalStyles.section}>
              <h3 className={modalStyles.sectionTitle}><Sparkles size={14} /> Highlights</h3>
              <ul className={modalStyles.highlights}>
                {candidate.score.highlights.map((h: string, idx: number) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.profile?.screenerQA?.question && candidate.profile?.screenerQA?.answer && (() => {
            const formattedAnswer = candidate.profile.screenerQA.answer
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/\r?\n/g, " | ");
            return (
              <div className={modalStyles.section}>
                <h3 className={modalStyles.sectionTitle}><HelpCircle size={14} /> Salary Q&A</h3>
                <div className={modalStyles.qaBlock}>
                  <p className={modalStyles.qaLine}>
                    <span className={modalStyles.qaLabel}>Q: </span>{candidate.profile.screenerQA.question}
                  </p>
                  <p className={modalStyles.qaLine}>
                    <span className={modalStyles.qaLabel}>A: </span>{formattedAnswer}
                  </p>
                </div>
              </div>
            );
          })()}

          {candidate.score?.education && candidate.score.education !== "Not Provided" && (
            <div className={modalStyles.section}>
              <h3 className={modalStyles.sectionTitle}><GraduationCap size={14} /> Education</h3>
              <p className={modalStyles.blockText}>{candidate.score.education}</p>
            </div>
          )}

          {(candidate.score?.experience_years !== undefined || (candidate.score?.extra_skills && candidate.score.extra_skills !== "Not Provided")) && (
            <div className={modalStyles.section}>
              <h3 className={modalStyles.sectionTitle}><Wrench size={14} /> Professional Details</h3>
              {candidate.score?.experience_years !== undefined && (
                <p className={modalStyles.inlineItem}><b>Experience:</b> {candidate.score.experience_years === 0 ? "No Experience" : `${candidate.score.experience_years} ${candidate.score.experience_years === 1 ? "Year" : "Years"}`}</p>
              )}
              {candidate.score?.extra_skills && candidate.score.extra_skills !== "Not Provided" && (
                <p className={modalStyles.blockText}><b>Extra Skills:</b> {candidate.score.extra_skills}</p>
              )}
            </div>
          )}

          {(candidate.score?.github_profile_link !== "Not Provided" || candidate.score?.portfolio_link !== "Not Provided") && (
            <div className={modalStyles.section}>
              <h3 className={modalStyles.sectionTitle}><ExternalLink size={14} /> External Links</h3>
              <div className={modalStyles.linkGroup}>
                {candidate.score?.github_profile_link !== "Not Provided" && (
                  <a href={candidate.score.github_profile_link} target="_blank" rel="noopener noreferrer" className={modalStyles.linkItem}>
                    <Github size={14} /> GitHub Profile
                  </a>
                )}
                {candidate.score?.portfolio_link !== "Not Provided" && (
                  <a href={candidate.score.portfolio_link} target="_blank" rel="noopener noreferrer" className={modalStyles.linkItem}>
                    <Layers size={14} /> Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={modalStyles.buttonGroup}>
          <a href={candidate.profile?.resumeUrl} target="_blank" rel="noopener noreferrer" className={modalStyles.resumeBtn}>
            <FileUser size={14} /> View Resume
          </a>
          {candidate.profile?.fullApplicationUrl && (
            <a href={candidate.profile.fullApplicationUrl} target="_blank" rel="noopener noreferrer" className={modalStyles.resumeBtn}>
              <Link size={14} /> View Job
            </a>
          )}
          {candidate.profile?.emailUrl && (
            <a href={candidate.profile.emailUrl} target="_blank" rel="noopener noreferrer" className={modalStyles.resumeBtn}>
              <MailOpen size={14} /> View Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}