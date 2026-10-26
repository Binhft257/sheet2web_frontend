import type { ReactNode } from "react";
import BrandMark from "@/src/components/common/brand-mark";
import styles from "@/src/components/viewer/published-view.module.css";

type ViewerShellProps = {
  children: ReactNode;
};

export default function ViewerShell({ children }: ViewerShellProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.shellContent}>
        <div className={styles.masthead}>
          <BrandMark />
          <span>Sheet2Web</span>
        </div>
        {children}
      </div>
    </main>
  );
}
