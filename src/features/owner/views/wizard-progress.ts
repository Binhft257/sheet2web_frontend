import { z } from "zod";
import type { SourceSummary, ViewDraftFormValues } from "./wizard-types";
import type { ViewAccessMode } from "@/src/types/view";
import type { ReloadMode } from "@/src/components/viewer/shared-view-render";

export type WizardProgress = {
  version: 1;
  viewId: string | null;
  isEditingExistingView: boolean;
  selectedDataSourceId: string;
  source: SourceSummary | null;
  formValues: ViewDraftFormValues;
  accessMode: ViewAccessMode;
  previewReloadMode: ReloadMode;
  previewIntervalSeconds: number;
};

const progressSchema = z.object({
  version: z.literal(1),
  viewId: z.string().nullable(),
  isEditingExistingView: z.boolean(),
  selectedDataSourceId: z.string(),
  source: z
    .object({
      id: z.string(),
      title: z.string(),
      sourceType: z.string(),
      sourceStatus: z.string(),
      spreadsheetId: z.string().nullable(),
      sheetCount: z.number().int().nonnegative().default(0),
      lastSyncedStructureAt: z.string().nullable().default(null),
      lastError: z.string().nullable().default(null),
      createdAt: z.string().default(""),
      updatedAt: z.string().default(""),
    })
    .nullable(),
  formValues: z.object({
    name: z.string(),
    sourceSheetId: z.string(),
    selectionType: z.enum(["full_sheet", "range"]),
    rangeA1Notation: z.string(),
    useFirstRowAsHeader: z.boolean(),
    themePreset: z.enum(["modern", "classic", "minimal"]),
  }),
  accessMode: z.enum(["public", "private"]),
  previewReloadMode: z.enum(["manual", "auto"]),
  previewIntervalSeconds: z.number().int().min(10),
});

export function isWizardProgressId(value: string | null): value is string {
  return Boolean(value && /^[a-zA-Z0-9-]{1,80}$/.test(value));
}

export function wizardProgressKey(ownerId: string, progressId: string) {
  return `sheet2web:wizard-progress:${ownerId}:${progressId}`;
}

export function readWizardProgress(key: string): WizardProgress | null {
  try {
    const stored = window.sessionStorage.getItem(key);
    if (!stored) return null;
    const result = progressSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeWizardProgress(key: string, progress: WizardProgress) {
  try {
    const result = progressSchema.safeParse(progress);
    if (result.success)
      window.sessionStorage.setItem(key, JSON.stringify(result.data));
  } catch {
    // Navigation still works when this tab cannot use browser storage.
  }
}

export function removeWizardProgress(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be disabled by the browser.
  }
}
