"use client";
import { useState } from "react";
import { Pencil, Plus, Save, X, Info } from "lucide-react";
import styles from "./jdModal.module.css";
import { KEYWORD_TOOLTIP } from "@/lib/utils/constants";

export default function JDFormModal({ jd, onClose, onSuccess }: any) {
  const [role, setRole] = useState(jd?.role || "");
  const [company, setCompany] = useState(jd?.company || "");
  const [jdText, setJdText] = useState(jd?.jd || "");
  const [keywordsInput, setKeywordsInput] = useState(jd?.keywords?.join(", ") || "");
  const [isActive, setIsActive] = useState(jd?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitFlash, setSubmitFlash] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!role.trim()) newErrors.role = "Role is required";
    if (!company.trim()) newErrors.company = "Company is required";
    if (!jdText.trim()) newErrors.jd = "Job Description is required";
    else if (jdText.trim().length < 100) newErrors.jd = "Job Description must be at least 100 characters";
    if (!keywordsInput.trim()) newErrors.keywords = "At least one keyword is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitFlash(true);
      setTimeout(() => setSubmitFlash(false), 2000);
      return;
    }
    setErrors({});

    const payload = {
      role,
      company,
      jd: jdText,
      keywords: keywordsInput.split(",").map((k: string) => k.trim()).filter((k: string) => k !== ""),
      isActive,
    };

    try {
      let res;
      if (jd) {
        res = await fetch(`/api/jds/${jd._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) { alert("Failed to save JD"); return; }
      onSuccess();
      onClose();
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap}>
            {jd
              ? <Pencil size={17} className={styles.modalIconSvg} />
              : <Plus size={17} className={styles.modalIconSvg} />
            }
          </div>
          <h2 className={styles.modalName}>
            {jd ? "Edit Job Description" : "Create Job Description"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <label className={styles.label}>Role</label>
            <input
              type="text"
              className={`${styles.input} ${errors.role ? styles.inputError : ""}`}
              placeholder="e.g. Senior Frontend Engineer"
              value={role}
              onChange={(e) => { setRole(e.target.value); if (errors.role) setErrors((p) => ({ ...p, role: "" })); }}
            />
            {errors.role && <span className={styles.fieldError}>{errors.role}</span>}

            <label className={styles.label}>Company</label>
            <input
              type="text"
              className={`${styles.input} ${errors.company ? styles.inputError : ""}`}
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => { setCompany(e.target.value); if (errors.company) setErrors((p) => ({ ...p, company: "" })); }}
            />
            {errors.company && <span className={styles.fieldError}>{errors.company}</span>}

            <label className={styles.label}>Job Description</label>
            <textarea
              className={`${styles.textarea} ${errors.jd ? styles.inputError : ""}`}
              value={jdText}
              onChange={(e) => { setJdText(e.target.value); if (errors.jd) setErrors((p) => ({ ...p, jd: "" })); }}
            />
            <span className={styles.wordCount}>{jdText.trim().length} / 100 characters minimum</span>
            {errors.jd && <span className={styles.fieldError}>{errors.jd}</span>}

            <div className={styles.labelRow}>
              <label className={styles.label}>Keywords (comma separated)</label>
              <div className={styles.tooltipWrap}>
                <Info size={13} className={styles.tooltipIcon} />
                <div className={styles.tooltip}>{KEYWORD_TOOLTIP}</div>
              </div>
            </div>
            <input
              type="text"
              className={`${styles.input} ${errors.keywords ? styles.inputError : ""}`}
              placeholder="e.g. react, nodejs, typescript, remote"
              value={keywordsInput}
              onChange={(e) => { setKeywordsInput(e.target.value); if (errors.keywords) setErrors((p) => ({ ...p, keywords: "" })); }}
            />
            {errors.keywords && <span className={styles.fieldError}>{errors.keywords}</span>}

            <div className={styles.toggleRow}>
              <span>Status</span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={isActive ? styles.activeText : styles.inactiveText}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {submitFlash && (
            <span className={styles.submitFlash}>Please fill in all required fields</span>
          )}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
            <Save size={14} /> Save JD
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}