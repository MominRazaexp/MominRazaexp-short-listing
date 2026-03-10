"use client";
import { useState } from "react";
import { Briefcase, Pencil, Trash2, X, AlertTriangle, Info } from "lucide-react";
import styles from "./jdModal.module.css";

const KEYWORD_TOOLTIP = "Keywords are used to match candidates to this JD. A candidate's resume is scanned for these keywords. The JD with the matching keywords extracted from the CV will be selected.";

export default function JDDetailModal({ jd, onClose, onEdit, onDelete }: any) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/jds/${jd._id}`, { method: "DELETE" });
      if (!res.ok) return;
      onDelete();
      onClose();
    } catch (error) {
      console.error("Delete failed");
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap} title={`Role: ${jd.role}`}>
            <Briefcase size={18} className={styles.modalIconSvg} />
          </div>
          <h2 className={styles.modalName}>{jd.role}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {jd.company && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Company</p>
              <p className={styles.jdText}>{jd.company}</p>
            </div>
          )}

          <div className={styles.section}>
            <p className={styles.sectionTitle}>Job Description</p>
            <pre className={styles.jdText}>{jd.jd}</pre>
          </div>

          {jd.keywords && jd.keywords.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitleRow}>
                <p className={styles.sectionTitle}>Keywords</p>
                <div className={styles.tooltipWrap}>
                  <Info size={13} className={styles.tooltipIcon} />
                  <div className={styles.tooltip}>{KEYWORD_TOOLTIP}</div>
                </div>
              </div>
              <div className={styles.keywordContainer}>
                {jd.keywords.map((keyword: string, index: number) => (
                  <span key={index} className={styles.keywordBadge}>{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onEdit}>
            <Pencil size={14} /> Edit
          </button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setShowConfirm(true)}>
            <Trash2 size={14} /> Delete
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Close
          </button>
        </div>

        {showConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIcon}>
                <AlertTriangle size={36} className={styles.confirmIconSvg} />
              </div>
              <h3 className={styles.confirmTitle}>Delete Job Description?</h3>
              <p className={styles.confirmText}>
                This action cannot be undone. The JD and all related data will be permanently removed.
              </p>
              <div className={styles.confirmActions}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleDelete}>
                  <Trash2 size={14} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}