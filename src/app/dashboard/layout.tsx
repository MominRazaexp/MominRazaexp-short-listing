"use client";

import Sidebar from "@/components/sidebar/SideBar";
import styles from "./dashboardLayout.module.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { getCookie } from "@/lib/utils/getCookie";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const isCallback = params.get("oauth_callback") === "true";

  if (isCallback) {
    window.history.replaceState({}, "", window.location.pathname);
  }

  const expirationValue = getCookie("gmail_watch_expiration");

  if (expirationValue) {
    const expiration = Number(expirationValue);
    const now = Date.now();

    if (expiration > now) {
      console.log("Gmail watch is valid, skipping the API call.");
      return;
    }

    console.log("Gmail watch has expired — renewing.");
    fetch("/api/gmail/watch").catch(console.error);
    return;
  }

  if (isCallback) {
    fetch("/api/gmail/watch").catch(console.error);
  } else {
    window.location.href = "/";
  }
}, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const getPageName = () => {
    if (pathname === "/dashboard") return "Candidates";
    if (pathname === "/dashboard/jd") return "Job Descriptions";
    return "Dashboard";
  };

  return (
    <div className={styles.wrapper}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            <span className={styles.headerCrumb}>Dashboard</span>
            <span className={styles.headerCrumbSep}>&nbsp;/&nbsp;</span>
            <span className={styles.headerPage}>{getPageName()}</span>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {theme === "dark"
                ? <><Sun size={15} className={styles.themeIcon} /><span> Light</span></>
                : <><Moon size={15} className={styles.themeIcon} /><span> Dark</span></>
              }
            </button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}