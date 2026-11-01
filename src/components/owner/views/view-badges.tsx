import StatusBadge from "@/src/components/common/status-badge";
import { GlobeIcon, LockIcon } from "@/src/components/common/icons";
import type { ViewAccessMode, ViewStatus } from "@/src/types/view";
import styles from "./view-badges.module.css";

export function ViewStatusBadge({ status }: { status: ViewStatus }) {
  switch (status.toLowerCase()) {
    case "published":
      return (
        <StatusBadge className={styles.badge} tone="success">
          Đã xuất bản
        </StatusBadge>
      );
    case "draft":
      return (
        <StatusBadge className={styles.badge} tone="warning">
          Bản nháp
        </StatusBadge>
      );
    case "archived":
      return (
        <StatusBadge className={styles.badge} tone="neutral">
          Đã lưu trữ
        </StatusBadge>
      );
    default:
      return (
        <StatusBadge className={styles.badge} tone="neutral">
          {status || "Bản nháp"}
        </StatusBadge>
      );
  }
}

export function ViewAccessBadge({
  accessMode,
}: {
  accessMode: ViewAccessMode;
}) {
  return accessMode === "private" ? (
    <StatusBadge className={styles.badge} tone="neutral" showDot={false}>
      <LockIcon />
      Riêng tư
    </StatusBadge>
  ) : (
    <StatusBadge className={styles.badge} tone="info" showDot={false}>
      <GlobeIcon />
      Công khai
    </StatusBadge>
  );
}
