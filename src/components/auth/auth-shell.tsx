import type { ReactNode } from "react";
import BrandMark from "@/src/components/common/brand-mark";
import styles from "./auth.module.css";

type AuthShellProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
};

export default function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <BrandMark />
          <span>Sheet2Web</span>
        </div>
        <section className={styles.card}>
          <header className={styles.header}>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {children}
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </section>
      </div>
    </main>
  );
}
