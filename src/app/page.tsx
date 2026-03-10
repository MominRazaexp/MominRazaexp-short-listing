import Image from "next/image";
import styles from "./page.module.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {

   const cookieStore = await cookies();
  const expirationCookie = cookieStore.get("gmail_watch_expiration");

  if (expirationCookie?.value) {
    const expiration = Number(expirationCookie.value);
    const now = Date.now(); 
    if (expiration > now) {
      redirect("/dashboard");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.gridBg} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <main className={styles.card}>
        <div className={styles.logoMark}>🤖</div>

        <h1 className={styles.title}>
          Indeed AI <span>Shortlister</span>
        </h1>

        <p className={styles.subtitle}>
          Automatically score applicants, shortlist the best candidates,
          and create Trello tickets — all powered by AI.
        </p>

        <div className={styles.divider}>
          <span>Sign in to continue</span>
        </div>

        <a href="/api/oauth/start" className={styles.googleButton}>
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span>Continue with Google</span>
        </a>

        <p className={styles.footer}>
          By signing in, you agree to our terms of service and privacy policy.
        </p>
        
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          AI-Powered Recruiting
        </div>
      </main>
    </div>
  );
}
