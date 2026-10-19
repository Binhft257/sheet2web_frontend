"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Synchronize the countdown when its mode or interval changes. */
import { useEffect, useState } from "react";
import type { ReloadMode } from "@/src/components/viewer/shared-view-render";
import type { WizardStep } from "@/src/features/owner/views/wizard-types";
import { MIN_PREVIEW_REFRESH_INTERVAL_SECONDS } from "@/src/features/owner/views/wizard-constants";

type PreviewRefreshOptions = {
  currentStep: WizardStep;
  previewReloadMode: ReloadMode;
  previewIntervalSeconds: number;
  handlePreview: () => Promise<void>;
};
export default function usePreviewRefresh({
  currentStep,
  previewReloadMode,
  previewIntervalSeconds,
  handlePreview,
}: PreviewRefreshOptions) {
  const [previewRemainingSeconds, setPreviewRemainingSeconds] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (currentStep !== 2 || previewReloadMode !== "auto") {
      setPreviewRemainingSeconds(null);
      return;
    }

    const safeInterval = Math.max(
      MIN_PREVIEW_REFRESH_INTERVAL_SECONDS,
      previewIntervalSeconds,
    );
    setPreviewRemainingSeconds(safeInterval);
    let remainingSeconds = safeInterval;

    const timer = window.setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds <= 0) {
        // Keep requests outside state updaters, which React may invoke twice.
        void handlePreview();
        remainingSeconds = safeInterval;
      }
      setPreviewRemainingSeconds(remainingSeconds);
    }, 1_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentStep, handlePreview, previewIntervalSeconds, previewReloadMode]);

  return previewRemainingSeconds;
}
