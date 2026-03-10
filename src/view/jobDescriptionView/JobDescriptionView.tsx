"use client";
import { useEffect, useState } from "react";
import JDFormModal from "@/components/modal/jd/JDFormModal";
import JDDetailModal from "@/components/modal/jd/JDDetailModal";
import { Briefcase, CalendarDays, CheckCircle, XCircle, Plus, ClipboardList } from "lucide-react";
import styles from "./jobDescriptionView.module.css";

export default function JobDescriptionView() {
  const [jds, setJds] = useState<any[]>([]);
  const [active, setActive] = useState(true);
  const [filteredJds, setFilteredJds] = useState<any[]>([]);
  const [selectedJD, setSelectedJD] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editJD, setEditJD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchJDs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jds");
      const data = await res.json();
      setJds(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJDs(); }, []);
  useEffect(() => {
    setFilteredJds(jds.filter((jd) => jd.isActive === active));
  }, [jds, active]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Job Descriptions</h1>
            <p className={styles.subtitle}>
              {loading
                ? "Loading positions..."
                : `${filteredJds.length} ${active ? "active" : "inactive"} position${filteredJds.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${active ? styles.activeTab : ""}`}
                onClick={() => setActive(true)}
              >
                Active
              </button>
              <button
                className={`${styles.toggleBtn} ${!active ? styles.activeTab : ""}`}
                onClick={() => setActive(false)}
              >
                Inactive
              </button>
            </div>

            <button className={styles.createBtn} onClick={() => setShowForm(true)}>
              <Plus size={15} /> Create JD
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className={styles.container}>
          {filteredJds.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <ClipboardList size={44} className={styles.emptyIconSvg} />
              </div>
              <h3 className={styles.emptyTitle}>No Job Descriptions Found</h3>
              <p className={styles.emptyText}>
                {active
                  ? "There are no active job descriptions yet."
                  : "There are no inactive job descriptions."}
              </p>
              <button className={styles.createBtn} onClick={() => setShowForm(true)}>
                <Plus size={14} /> Create Your First JD
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredJds.map((jd) => (
                <div key={jd._id} className={styles.card} onClick={() => setSelectedJD(jd)}>
                  <div className={styles.cardHeader}>
                    <div className={styles.roleArea}>
                      <div className={styles.roleIcon}>
                        <Briefcase size={16} className={styles.roleIconSvg} />
                      </div>
                      <h3 className={styles.role}>{jd.role}</h3>
                    </div>
                    <span className={`${styles.statusBadge} ${jd.isActive ? styles.active : styles.inactive}`}>
                      {jd.isActive ? (
                        <><CheckCircle size={12} /> Active</>
                      ) : (
                        <><XCircle size={12} /> Inactive</>
                      )}
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <CalendarDays size={13} className={styles.icon} />
                    <span>{new Date(jd.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && <JDFormModal onClose={() => setShowForm(false)} onSuccess={fetchJDs} />}
      {editJD && <JDFormModal jd={editJD} onClose={() => setEditJD(null)} onSuccess={fetchJDs} />}
      {selectedJD && (
        <JDDetailModal
          jd={selectedJD}
          onClose={() => setSelectedJD(null)}
          onEdit={() => { setEditJD(selectedJD); setSelectedJD(null); }}
          onDelete={fetchJDs}
        />
      )}
    </>
  );
}