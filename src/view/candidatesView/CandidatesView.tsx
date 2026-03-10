"use client";
import { useEffect, useState } from "react";
import { Briefcase, Mail, ChevronLeft, ChevronRight, Trophy, ClipboardList, UserCheck, UserX } from "lucide-react";
import CandidateModal from "@/components/modal/candidate/CandidateModal";
import styles from "./candidatesView.module.css";
import { Candidate } from "@/types/candidate";

export default function CandidatesView() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [shortlisted, setShortlisted] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candidates?shortlisted=${shortlisted}&page=${page}&limit=12`);
      const data = await res.json();
      setCandidates(data.candidates);
      setTotalPages(data.pages);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [shortlisted, page]);

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?";
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Candidates</h1>
            <p className={styles.subtitle}>
              {shortlisted ? "Shortlisted applicants" : "Unshortlisted applicants"} — Page {page} of {totalPages}
            </p>
          </div>

          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn} ${shortlisted ? styles.activeTab : ""}`}
              onClick={() => { setShortlisted(true); setPage(1); }}
            >
              <UserCheck size={13} className={styles.toggleIcon} /> Shortlisted
            </button>
            <button
              className={`${styles.toggleBtn} ${!shortlisted ? styles.activeTab : ""}`}
              onClick={() => { setShortlisted(false); setPage(1); }}
            >
              <UserX size={13} className={styles.toggleIcon} /> Unshortlisted
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </div>
          ))}
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {shortlisted
              ? <Trophy size={44} className={styles.emptyIconSvg} />
              : <ClipboardList size={44} className={styles.emptyIconSvg} />}
          </div>
          <h3 className={styles.emptyTitle}>
            {shortlisted ? "No shortlisted candidates" : "No unshortlisted candidates"}
          </h3>
          <p className={styles.emptyText}>
            {shortlisted
              ? "Candidates that meet your criteria will appear here."
              : "All candidates have been shortlisted."}
          </p>
        </div>
      )}

      {!loading && candidates.length > 0 && (
        <div className={styles.candidateContainer}>
          <div className={styles.candidateList}>
            {candidates.map((c) => (
              <div
                key={c._id}
                className={styles.candidateCard}
                onClick={() => setSelectedCandidate(c)}
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatarArea}>
                    <div className={styles.avatar}>{getInitials(c.candidate_name)}</div>
                    <div className={styles.nameBlock}>
                      <div className={styles.name}>{c.candidate_name}</div>
                      <div className={styles.dateText}>
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className={styles.scoreBadge}>
                    <span className={styles.scoreValue}>{c.score?.match_score ?? 0}%</span>
                  </div>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaRow}>
                    <Briefcase size={13} />
                    <span className={styles.metaText}>{c.applied_role}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <Mail size={13} />
                    <span className={styles.metaText}>{c.candidate_email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={15} /> Previous
          </button>
          <span className={styles.paginationInfo}>Page {page} / {totalPages}</span>
          <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </>
  );
}