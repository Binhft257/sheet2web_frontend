import { appPath } from "@/src/lib/app-path";
import type {
  WizardStep,
  SourceSummary,
  ViewDraftFormValues,
  ViewDraftFormErrors,
} from "@/src/features/owner/views/wizard-types";
import type {
  CreateViewBody,
  UpdateViewBody,
  ViewAccessMode,
  OwnerViewDetail,
} from "@/src/types/view";

export function replaceWizardUrl(viewId: string | null, step: WizardStep) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();
  if (viewId) {
    params.set("viewId", viewId);
  }
  params.set("step", String(step));

  window.history.replaceState(
    null,
    "",
    appPath(`/owner/views/new?${params.toString()}`),
  );
}

export function formatDate(dateTime: string | null | undefined) {
  if (!dateTime) {
    return "--";
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function getSourceTypeLabel(sourceType: string) {
  return sourceType.trim().toLowerCase() === "google_sheet"
    ? "Google Sheet"
    : sourceType || "Google Sheet";
}

export function createSourceSummary(
  view: OwnerViewDetail,
): SourceSummary | null {
  if (!view.dataSource) {
    return null;
  }

  return {
    id: view.dataSource.id,
    title: view.dataSource.title,
    sourceType: view.dataSource.sourceType ?? "google_sheet",
    sourceStatus: view.dataSource.sourceStatus ?? "active",
    spreadsheetId: view.dataSource.spreadsheetId ?? null,
    sheetCount: 0,
    lastSyncedStructureAt: view.dataSource.lastSyncedStructureAt ?? null,
    lastError: null,
    createdAt: view.createdAt,
    updatedAt: view.updatedAt,
  };
}

export function validateDraftForm(
  values: ViewDraftFormValues,
): ViewDraftFormErrors {
  const errors: ViewDraftFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Vui lòng nhập tên View.";
  }

  if (!values.sourceSheetId) {
    errors.sourceSheetId = "Vui lòng chọn sheet/tab.";
  }

  if (values.selectionType === "range" && !values.rangeA1Notation.trim()) {
    errors.rangeA1Notation = "Vui lòng nhập Range A1.";
  }

  return errors;
}

export function buildCreateViewBody(
  dataSourceId: string,
  values: ViewDraftFormValues,
  accessMode: ViewAccessMode,
): CreateViewBody {
  const body: CreateViewBody = {
    dataSourceId,
    sourceSheetId: values.sourceSheetId,
    name: values.name.trim(),
    selectionType: values.selectionType,
    rangeA1Notation:
      values.selectionType === "range" ? values.rangeA1Notation.trim() : "",
    accessMode,
    useFirstRowAsHeader: values.useFirstRowAsHeader,
    allowThemeSwitch: false,
    themeId: null,
    themeOverrideJson: {
      preset: values.themePreset,
    },
  };

  return body;
}

export function buildUpdateViewBody(
  values: ViewDraftFormValues,
  accessMode: ViewAccessMode,
): UpdateViewBody {
  const body: UpdateViewBody = {
    sourceSheetId: values.sourceSheetId,
    name: values.name.trim(),
    selectionType: values.selectionType,
    rangeA1Notation:
      values.selectionType === "range" ? values.rangeA1Notation.trim() : "",
    accessMode,
    useFirstRowAsHeader: values.useFirstRowAsHeader,
    allowThemeSwitch: false,
    themeId: null,
    themeOverrideJson: {
      preset: values.themePreset,
    },
  };

  return body;
}
