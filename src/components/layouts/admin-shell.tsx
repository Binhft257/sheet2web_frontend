import type { ReactNode } from "react";
import AppLink from "@/src/components/app-link";
import BrandMark from "@/src/components/common/brand-mark";
import AdminSidebar from "@/src/components/layouts/admin-sidebar";
import styles from "./admin.module.css";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className="ui-skip-link" href="#admin-content">
        Đến nội dung chính
      </a>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <BrandMark />
            <div>
              <span>Sheet2Web</span>
              <p>Không gian quản trị</p>
            </div>
          </div>
          <AppLink className="ui-button" data-variant="outlined" href="/">
            Đổi không gian
          </AppLink>
        </div>
      </header>
      <div className={styles.content}>
        <AdminSidebar />
        <main className={styles.main} id="admin-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
