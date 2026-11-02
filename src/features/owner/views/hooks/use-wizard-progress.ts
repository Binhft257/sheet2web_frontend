"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore tab-local progress after the authenticated session is available. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  isWizardProgressId,
  readWizardProgress,
  removeWizardProgress,
  wizardProgressKey,
  writeWizardProgress,
  type WizardProgress,
} from "@/src/features/owner/views/wizard-progress";

export default function useWizardProgress(
  initialViewId: string | null,
  enabled: boolean,
) {
  const { data: session, status } = useSession();
  const ownerId = session?.user?.id;
  const initialized = useRef(false);
  const cleared = useRef(false);
  const [isReady, setIsReady] = useState(!enabled);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<WizardProgress | null>(null);

  useEffect(() => {
    if (!enabled || status === "loading" || initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const existingId = params.get("progressId");
    const progressId = isWizardProgressId(existingId)
      ? existingId
      : window.crypto.randomUUID();
    const key = ownerId ? wizardProgressKey(ownerId, progressId) : null;
    const stored = existingId && key ? readWizardProgress(key) : null;
    if (stored?.viewId === initialViewId) setSnapshot(stored);
    setStorageKey(key);
    params.set("progressId", progressId);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    setIsReady(true);
  }, [enabled, initialViewId, ownerId, status]);

  const save = useCallback(
    (progress: WizardProgress) => {
      if (storageKey && !cleared.current)
        writeWizardProgress(storageKey, progress);
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    cleared.current = true;
    if (storageKey) removeWizardProgress(storageKey);
  }, [storageKey]);

  return { isReady, snapshot, save, clear };
}
