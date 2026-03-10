import styles from "./page.module.css";

export default function NoAccessPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Access Denied
      </h1>
      <p className={styles.description}>
        Your Google account does not have permission to access this application.
      </p>
    </div>
  );
}