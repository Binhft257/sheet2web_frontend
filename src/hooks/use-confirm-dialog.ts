"use client";

import { useState } from "react";
import type {
  ConfirmDialogOptions,
  ConfirmDialogProps,
} from "@/src/components/common/confirm-dialog";

export default function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  function requestConfirmation(next: ConfirmDialogOptions) {
    setOptions((current) => current ?? next);
  }

  const dialogProps: ConfirmDialogProps | null = options
    ? { ...options, onClose: () => setOptions(null) }
    : null;

  return { requestConfirmation, dialogProps };
}
