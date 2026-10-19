import StatusBadge from "@/src/components/common/status-badge";
import type { ViewAccessMode, ViewStatus } from "@/src/types/view";

export function ViewStatusBadge({ status }: { status: ViewStatus }) {
  switch (status.toLowerCase()) {
    case "published":
      return <StatusBadge tone="success">Đã xuất bản</StatusBadge>;
    case "draft":
      return <StatusBadge tone="warning">Bản nháp</StatusBadge>;
    case "archived":
      return <StatusBadge tone="neutral">Đã lưu trữ</StatusBadge>;
    default:
      return <StatusBadge tone="neutral">{status || "Bản nháp"}</StatusBadge>;
  }
}

export function ViewAccessBadge({
  accessMode,
}: {
  accessMode: ViewAccessMode;
}) {
  return accessMode === "private" ? (
    <StatusBadge tone="neutral">Riêng tư</StatusBadge>
  ) : (
    <StatusBadge tone="info">Công khai</StatusBadge>
  );
}
