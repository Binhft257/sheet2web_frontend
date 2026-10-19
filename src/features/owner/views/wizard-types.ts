import type { DataSource } from "@/src/types/data-source";
import type { ThemePreset, ViewSelectionType } from "@/src/types/view";

export type WizardStep = 1 | 2 | 3;

export type CreateViewWizardProps = {
  initialStep?: WizardStep;
  initialViewId?: string | null;
};

export type SourceSummary = Pick<
  DataSource,
  | "id"
  | "title"
  | "sourceType"
  | "sourceStatus"
  | "spreadsheetId"
  | "sheetCount"
  | "lastSyncedStructureAt"
  | "lastError"
  | "createdAt"
  | "updatedAt"
>;

export type ViewDraftFormValues = {
  name: string;
  sourceSheetId: string;
  selectionType: ViewSelectionType;
  rangeA1Notation: string;
  useFirstRowAsHeader: boolean;
  themePreset: ThemePreset;
};

export type ViewDraftFormErrors = Partial<
  Record<keyof ViewDraftFormValues, string>
>;
