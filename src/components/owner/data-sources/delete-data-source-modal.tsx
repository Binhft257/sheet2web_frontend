"use client";

import ConfirmDialog from "@/src/components/common/confirm-dialog";
import type { DataSource } from "@/src/types/data-source";

type DeleteDataSourceModalProps = {
  open: boolean;
  dataSource: DataSource | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteDataSourceModal({
  open,
  dataSource,
  isSubmitting = false,
  onClose,
  onConfirm,
}: DeleteDataSourceModalProps) {
  if (!open || !dataSource) return null;
  return (
    <ConfirmDialog
      title="Xóa nguồn dữ liệu"
      message={`Bạn muốn xóa nguồn “${dataSource.title}”? Các trang dữ liệu sử dụng nguồn này cũng sẽ bị lưu trữ và không còn truy cập được qua link đã xuất bản.`}
      confirmLabel="Xóa nguồn"
      pendingLabel="Đang xóa..."
      errorMessage="Không thể xóa nguồn dữ liệu. Vui lòng thử lại."
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
