"use client";

import { CheckIcon, CloseIcon } from "@/src/components/common/icons";

type ToastProps = { message: string | null; onDismiss: () => void };

export default function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      className="ui-toast-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message ? (
        <div className="ui-toast">
          <CheckIcon className="h-5 w-5 shrink-0" />
          <span>{message}</span>
          <button
            className="ui-icon-button"
            aria-label="Đóng thông báo"
            onClick={onDismiss}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
