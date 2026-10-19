import type { ViewDraftFormValues } from "@/src/features/owner/views/wizard-types";

export const DATA_SOURCES_LIMIT = 20;
export const MIN_PREVIEW_REFRESH_INTERVAL_SECONDS = 10;
export const DEFAULT_FORM_VALUES: ViewDraftFormValues = {
  name: "",
  sourceSheetId: "",
  selectionType: "range",
  rangeA1Notation: "A1:D10",
  useFirstRowAsHeader: true,
  themePreset: "modern",
};
