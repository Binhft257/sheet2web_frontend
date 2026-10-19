"use client";

import { useState } from "react";
import Modal from "@/src/components/common/modal";
import { WarningIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  if (!open || !dataSource) return null;

  function handleClose() {
    if (isSubmitting) return;
    setSubmitError(null);
    onClose();
  }

  async function handleConfirm() {
    setSubmitError(null);
    try {
      await onConfirm();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Không thể xóa nguồn dữ liệu.",
      );
    }
  }

  return (
    <Modal
      open={open}
      title="Xóa nguồn dữ liệu"
      size="sm"
      busy={isSubmitting}
      onClose={handleClose}
    >
      <div className="ui-modal-body space-y-5">
        <span className="ui-delete-icon" aria-hidden="true">
          <WarningIcon />
        </span>
        <p className="text-sm leading-7 text-muted">
          Bạn chắc chắn muốn xóa nguồn{" "}
          <strong className="font-semibold break-words text-ink">
            {dataSource.title}
          </strong>
          ?
        </p>
        {submitError ? (
          <p className="ui-alert" role="alert">
            {submitError}
          </p>
        ) : null}
      </div>
      <div className="ui-modal-footer">
        <SharedButton
          variant="outlined"
          disabled={isSubmitting}
          onClick={handleClose}
        >
          Hủy
        </SharedButton>
        <SharedButton
          variant="danger"
          disabled={isSubmitting}
          onClick={handleConfirm}
        >
          {isSubmitting ? "Đang xóa..." : "Xóa"}
        </SharedButton>
      </div>
    </Modal>
  );
}
