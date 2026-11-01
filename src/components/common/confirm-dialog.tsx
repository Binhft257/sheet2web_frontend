"use client";

import { useId, useRef, useState } from "react";
import Modal from "./modal";
import { WarningIcon } from "./icons";
import { SharedButton } from "@/src/components/share";

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel?: string;
  errorMessage?: string;
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<unknown>;
};

export type ConfirmDialogProps = ConfirmDialogOptions & {
  onClose: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  pendingLabel = "Đang xử lý...",
  errorMessage = "Không thể thực hiện thao tác. Vui lòng thử lại.",
  isSubmitting = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const submitLock = useRef(false);
  const messageId = useId();
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const busy = pending || isSubmitting;

  function handleClose() {
    if (!submitLock.current && !isSubmitting) onClose();
  }

  async function handleConfirm() {
    if (submitLock.current || isSubmitting) return;
    submitLock.current = true;
    setPending(true);
    setSubmitError(null);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : errorMessage,
      );
    } finally {
      submitLock.current = false;
      setPending(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      size="sm"
      busy={busy}
      role="alertdialog"
      ariaDescribedBy={messageId}
      initialFocusRef={cancelRef}
      onClose={handleClose}
    >
      <div className="ui-modal-body space-y-5">
        <span className="ui-delete-icon" aria-hidden="true">
          <WarningIcon />
        </span>
        <p
          id={messageId}
          className="text-sm leading-7 text-muted [overflow-wrap:anywhere]"
        >
          {message}
        </p>
        {submitError ? (
          <p className="ui-alert" role="alert">
            {submitError}
          </p>
        ) : null}
      </div>
      <div className="ui-modal-footer">
        <SharedButton
          ref={cancelRef}
          variant="outlined"
          disabled={busy}
          onClick={handleClose}
        >
          Hủy
        </SharedButton>
        <SharedButton
          variant="danger"
          disabled={busy}
          aria-busy={busy}
          onClick={handleConfirm}
        >
          {busy ? pendingLabel : confirmLabel}
        </SharedButton>
      </div>
    </Modal>
  );
}
