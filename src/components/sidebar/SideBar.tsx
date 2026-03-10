"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Zap, Users, FileText, Activity, ClipboardList } from "lucide-react";
import styles from "./SideBar.module.css";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className={styles.mobileOverlay} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>
              <Zap size={17} className={styles.logoIconSvg} />
            </div>
            <div>
              <div className={styles.logoText}>ATS Pro</div>
              <div className={styles.logoSub}>AI Recruiting Dashboard</div>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Navigation</div>

          <Link
            href="/dashboard"
            className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
            onClick={onClose}
          >
            <div className={styles.navItemIcon}>
              <Users size={15} />
            </div>
            Candidates
          </Link>

          <Link
            href="/dashboard/jd"
            className={`${styles.navItem} ${pathname === "/dashboard/jd" ? styles.active : ""}`}
            onClick={onClose}
          >
            <div className={styles.navItemIcon}>
              <ClipboardList size={15} />
            </div>
            Job Descriptions
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.versionTag}>
            <span className={styles.versionDot} />
            <Activity size={11} className={styles.versionIcon} />
            System Active
          </div>
        </div>
      </aside>
    </>
  );
}