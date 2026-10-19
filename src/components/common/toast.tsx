"use client";

import {
  CheckIcon,
  CloseIcon,
  WarningIcon,
} from "@/src/components/common/icons";

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
  tone?: "success" | "error";
  placement?: "floating" | "inline";
};

export default function Toast({
  message,
  onDismiss,
  tone = "success",
  placement = "floating",
}: ToastProps) {
  return (
    <div
      className={placement === "inline" ? "ui-toast-inline" : "ui-toast-region"}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {message ? (
        <div className="ui-toast" data-tone={tone}>
          {tone === "error" ? (
            <WarningIcon className="h-5 w-5 shrink-0" />
          ) : (
            <CheckIcon className="h-5 w-5 shrink-0" />
          )}
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
