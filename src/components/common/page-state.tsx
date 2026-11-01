import type { ReactNode } from "react";
import BrandMark from "@/src/components/common/brand-mark";
import { TableIcon } from "@/src/components/common/icons";
import styles from "./page-state.module.css";

type PageStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h1" | "h2";
  fullPage?: boolean;
  code?: string;
};

export default function PageState({
  title,
  description,
  icon,
  actions,
  headingLevel: Heading = "h1",
  fullPage = false,
  code,
}: PageStateProps) {
  const content = (
    <section className={styles.state}>
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <TableIcon />}
      </span>
      {code ? <p className={styles.code}>{code}</p> : null}
      <Heading>{title}</Heading>
      <p className={styles.description}>{description}</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
  return fullPage ? (
    <main className={styles.shell}>
      <div className={styles.fullContent}>
        <div className={styles.brand}>
          <BrandMark />
          <span>Sheet2Web</span>
        </div>
        {content}
      </div>
    </main>
  ) : (
    content
  );
}
