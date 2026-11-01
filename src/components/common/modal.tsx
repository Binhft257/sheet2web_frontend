"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { CloseIcon } from "@/src/components/common/icons";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  busy?: boolean;
  size?: "sm" | "md" | "lg";
  role?: "dialog" | "alertdialog";
  ariaDescribedBy?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
};

let openModalCount = 0;
let originalBodyOverflow = "";

function lockPageScroll() {
  if (openModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openModalCount += 1;
  return () => {
    openModalCount -= 1;
    if (openModalCount === 0)
      document.body.style.overflow = originalBodyOverflow;
  };
}

export default function Modal({
  open,
  title,
  description,
  busy = false,
  size = "md",
  role = "dialog",
  ariaDescribedBy,
  initialFocusRef,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (open && busy) dialogRef.current?.focus();
  }, [open, busy]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const unlockScroll = lockPageScroll();
    dialog.showModal();
    const initialFocus =
      initialFocusRef?.current ??
      dialog.querySelector<HTMLInputElement>("input:not([disabled])");
    initialFocus?.focus();

    return () => {
      dialog.close();
      unlockScroll();
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [open, initialFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      className="ui-modal"
      role={role}
      closedby={busy ? "none" : "closerequest"}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={
        ariaDescribedBy ?? (description ? descriptionId : undefined)
      }
      aria-busy={busy}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (busy || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="ui-modal-surface">
        <div className="ui-modal-header">
          <div className="min-w-0">
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button
            className="ui-icon-button"
            aria-label="Đóng hộp thoại"
            disabled={busy}
            onClick={onClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
