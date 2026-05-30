import { NavBar } from "./NavBar";
import styles from "./AppShell.module.css";

export function AppShell({
  userName,
  isAdmin = false,
  children,
}: {
  userName: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <NavBar userName={userName} isAdmin={isAdmin} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
