"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import AddDataSourceModal from "@/src/components/owner/data-sources/add-data-source-modal";
import StatusBadge from "@/src/components/owner/data-sources/status-badge";
import PreviewTable from "@/src/components/owner/views/preview-table";
import ViewForm, {
  type ViewDraftFormErrors,
  type ViewDraftFormValues,
} from "@/src/components/owner/views/view-form";
import ViewStepper from "@/src/components/owner/views/view-stepper";
import ViewSummary from "@/src/components/owner/views/view-summary";
import {
  useCreateDataSource,
  useDataSourceSheets,
  useDataSources,
  usePreviewDataSource,
} from "@/src/hooks/owner/use-data-sources";
import {
  useCreateView,
  usePublishView,
  useUpdatePublishedView,
  useUpdateView,
  useView,
} from "@/src/hooks/owner/use-views";
import type {
  CreateDataSourceBody,
  DataSource,
  DataSourcePreview,
} from "@/src/types/data-source";
import type {
  CreateViewBody,
  OwnerViewDetail,
  ThemePreset,
  UpdateViewBody,
  ViewAccessMode,
  ViewJsonObject,
} from "@/src/types/view";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ChangeEvent, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";

type WizardStep = 1 | 2 | 3;

type ToastMessage = {
  type: "success" | "error";
  message: string;
};

type CreateViewWizardProps = {
  initialStep?: WizardStep;
  initialViewId?: string | null;
};

type SourceSummary = Pick<
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

const DATA_SOURCES_LIMIT = 20;
const DEFAULT_FORM_VALUES: ViewDraftFormValues = {
  name: "",
  sourceSheetId: "",
  selectionType: "range",
  rangeA1Notation: "A1:D10",
  useFirstRowAsHeader: true,
  refreshMode: "manual",
  refreshIntervalSeconds: 60,
  themePreset: "modern",
};

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SheetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="16" rx="2" width="14" x="5" y="4" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  );
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="12" rx="2" width="12" x="8" y="8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function ExternalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function replaceWizardUrl(viewId: string | null, step: WizardStep) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();
  if (viewId) {
    params.set("viewId", viewId);
  }
  params.set("step", String(step));

  window.history.replaceState(null, "", `/owner/views/new?${params.toString()}`);
}

function formatDate(dateTime: string | null | undefined) {
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

function getSourceTypeLabel(sourceType: string) {
  return sourceType.trim().toLowerCase() === "google_sheet"
    ? "Google Sheet"
    : sourceType || "Google Sheet";
}

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "modern" || value === "classic" || value === "minimal";
}

function getThemePreset(themeOverrideJson: ViewJsonObject | null | undefined) {
  const preset = themeOverrideJson?.preset;
  return isThemePreset(preset) ? preset : "modern";
}

function isAutoPublishEnabled(settingsJson: ViewJsonObject | null | undefined) {
  return settingsJson?.autoPublishEnabled === true;
}

function buildSettingsJson(values: ViewDraftFormValues): ViewJsonObject {
  return {
    autoPublishEnabled: values.refreshMode === "interval",
  };
}

function getRefreshIntervalSeconds(values: ViewDraftFormValues) {
  return Math.max(1, Number(values.refreshIntervalSeconds) || 60);
}

function createSourceSummary(view: OwnerViewDetail): SourceSummary | null {
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

function validateDraftForm(
  values: ViewDraftFormValues,
): ViewDraftFormErrors {
  const errors: ViewDraftFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Vui lòng nhập tên View.";
  }

  if (!values.sourceSheetId) {
    errors.sourceSheetId = "Vui lòng chọn sheet/tab.";
  }

  if (
    values.selectionType === "range" &&
    !values.rangeA1Notation.trim()
  ) {
    errors.rangeA1Notation = "Vui lòng nhập Range A1.";
  }

  if (
    values.refreshMode === "interval" &&
    (!Number.isFinite(values.refreshIntervalSeconds) ||
      values.refreshIntervalSeconds <= 0)
  ) {
    errors.refreshIntervalSeconds = "Refresh interval phải lớn hơn 0.";
  }

  return errors;
}

function buildCreateViewBody(
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
    settingsJson: buildSettingsJson(values),
  };

  if (values.refreshMode === "interval") {
    body.refreshIntervalSeconds = getRefreshIntervalSeconds(values);
  }

  return body;
}

function buildUpdateViewBody(
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
    settingsJson: buildSettingsJson(values),
  };

  if (values.refreshMode === "interval") {
    body.refreshIntervalSeconds = getRefreshIntervalSeconds(values);
  }

  return body;
}

export default function CreateViewWizard({
  initialStep = 1,
  initialViewId = null,
}: CreateViewWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [viewId, setViewId] = useState<string | null>(initialViewId);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState("");
  const [hydratedSource, setHydratedSource] = useState<SourceSummary | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formValues, setFormValues] =
    useState<ViewDraftFormValues>(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<ViewDraftFormErrors>({});
  const [accessMode, setAccessMode] = useState<ViewAccessMode>("public");
  const [preview, setPreview] = useState<DataSourcePreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [hydratedViewId, setHydratedViewId] = useState<string | null>(null);

  const dataSourcesQuery = useDataSources({
    page: 1,
    limit: DATA_SOURCES_LIMIT,
    search,
  });
  const sheetsQuery = useDataSourceSheets(selectedDataSourceId || null);
  const viewQuery = useView(viewId);
  const previewMutation = usePreviewDataSource(selectedDataSourceId || null);
  const createDataSourceMutation = useCreateDataSource();
  const createViewMutation = useCreateView();
  const updateViewMutation = useUpdateView();
  const updatePublishedViewMutation = useUpdatePublishedView();
  const publishViewMutation = usePublishView();

  const dataSources = dataSourcesQuery.data?.items ?? [];
  const selectedDataSource =
    dataSources.find((item) => item.id === selectedDataSourceId) ??
    hydratedSource;
  const sheets = useMemo(() => sheetsQuery.data ?? [], [sheetsQuery.data]);
  const selectedSheet = sheets.find(
    (sheet) => sheet.id === formValues.sourceSheetId,
  );
  const selectedSheetName =
    selectedSheet?.sheetName ??
    viewQuery.data?.sourceSheet?.sheetName ??
    "";
  const isDraftSaving =
    createViewMutation.isPending ||
    updateViewMutation.isPending ||
    updatePublishedViewMutation.isPending;
  const sourceLocked = Boolean(viewId);
  const isEditingPublishedView =
    viewQuery.data?.status === "published" || Boolean(publishedSlug || publishedUrl);

  useEffect(() => {
    const view = viewQuery.data;
    if (!view || hydratedViewId === view.id) {
      return;
    }

    setHydratedViewId(view.id);
    setSelectedDataSourceId(view.dataSourceId);
    setHydratedSource(createSourceSummary(view));
    setFormValues({
      name: view.name,
      sourceSheetId: view.sourceSheetId,
      selectionType: view.selectionType,
      rangeA1Notation: view.rangeA1Notation ?? "",
      useFirstRowAsHeader: view.useFirstRowAsHeader,
      refreshMode: isAutoPublishEnabled(view.settingsJson)
        ? "interval"
        : "manual",
      refreshIntervalSeconds: view.refreshIntervalSeconds || 60,
      themePreset: getThemePreset(view.themeOverrideJson),
    });
    setAccessMode(view.accessMode === "private" ? "private" : "public");
    setPublishedSlug(view.status === "published" ? view.slug : null);
    setPublishedUrl(view.status === "published" ? `/v/${view.slug}` : null);
  }, [hydratedViewId, viewQuery.data]);

  useEffect(() => {
    if (!sheets.length || formValues.sourceSheetId) {
      return;
    }

    const firstVisibleSheet =
      sheets.find((sheet) => !sheet.isHidden) ?? sheets[0];
    if (!firstVisibleSheet) {
      return;
    }

    setFormValues((previous) => ({
      ...previous,
      sourceSheetId: firstVisibleSheet.id,
    }));
  }, [formValues.sourceSheetId, sheets]);

  const viewUrlLabel = useMemo(() => {
    if (publishedUrl) {
      return publishedUrl;
    }

    if (publishedSlug) {
      return `/v/${publishedSlug}`;
    }

    return "Sẽ có sau khi xuất bản";
  }, [publishedSlug, publishedUrl]);

  function showToast(type: ToastMessage["type"], message: string) {
    setToastMessage({ type, message });
  }

  function updateExistingViewSettings(id: string) {
    const body = buildUpdateViewBody(formValues, accessMode);

    return isEditingPublishedView
      ? updatePublishedViewMutation.mutateAsync({ id, body })
      : updateViewMutation.mutateAsync({ id, body });
  }

  function goToStep(step: WizardStep) {
    setCurrentStep(step);
    replaceWizardUrl(viewId, step);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  function handleSelectSource(source: DataSource) {
    if (sourceLocked && source.id !== selectedDataSourceId) {
      return;
    }

    setSelectedDataSourceId(source.id);
    setHydratedSource(source);
    setPreview(null);
    setPreviewError(null);
    setFormValues((previous) => ({
      ...previous,
      name: previous.name.trim() ? previous.name : source.title,
      sourceSheetId:
        source.id === selectedDataSourceId ? previous.sourceSheetId : "",
    }));
  }

  async function handleCreateDataSource(values: CreateDataSourceBody) {
    const createdSource = await createDataSourceMutation.mutateAsync(values);
    setSelectedDataSourceId(createdSource.id);
    setHydratedSource(createdSource);
    setFormValues((previous) => ({
      ...previous,
      name: previous.name.trim() ? previous.name : createdSource.title,
      sourceSheetId: "",
    }));
    setPreview(null);
    setPreviewError(null);
    showToast("success", "Thêm nguồn dữ liệu thành công.");
    await queryClient.invalidateQueries({ queryKey: ["data-sources"] });
  }

  function handleNextFromSource() {
    if (!selectedDataSourceId) {
      showToast("error", "Vui lòng chọn nguồn dữ liệu.");
      return;
    }

    goToStep(2);
  }

  async function handlePreview() {
    if (!selectedDataSourceId) {
      showToast("error", "Vui lòng chọn nguồn dữ liệu.");
      goToStep(1);
      return;
    }

    const errors = validateDraftForm(formValues);
    const previewErrors: ViewDraftFormErrors = {};
    if (errors.sourceSheetId) {
      previewErrors.sourceSheetId = errors.sourceSheetId;
    }
    if (errors.rangeA1Notation) {
      previewErrors.rangeA1Notation = errors.rangeA1Notation;
    }

    if (Object.keys(previewErrors).length > 0) {
      setFormErrors((previous) => ({
        ...previous,
        ...previewErrors,
      }));
      showToast("error", "Vui lòng kiểm tra cấu hình preview.");
      return;
    }

    setPreviewError(null);

    try {
      const result = await previewMutation.mutateAsync({
        sourceSheetId: formValues.sourceSheetId,
        rangeA1Notation:
          formValues.selectionType === "range"
            ? formValues.rangeA1Notation.trim()
            : "",
        useFirstRowAsHeader: formValues.useFirstRowAsHeader,
      });
      setPreview(result);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể preview dữ liệu.");
      setPreviewError(message);
      showToast("error", message);
    }
  }

  function handleContinueFromConfig() {
    if (!selectedDataSourceId) {
      showToast("error", "Vui lÃ²ng chá»n nguá»“n dá»¯ liá»‡u.");
      goToStep(1);
      return;
    }

    const errors = validateDraftForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast("error", "Vui lÃ²ng kiá»ƒm tra láº¡i cáº¥u hÃ¬nh view.");
      return;
    }

    setCurrentStep(3);
    replaceWizardUrl(viewId, 3);
  }

  async function saveDraft(goNext: boolean) {
    if (!selectedDataSourceId) {
      showToast("error", "Vui lòng chọn nguồn dữ liệu.");
      goToStep(1);
      return null;
    }

    const errors = validateDraftForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast("error", "Vui lòng kiểm tra lại cấu hình view.");
      return null;
    }

    try {
      const savedView = viewId
        ? await updateExistingViewSettings(viewId)
        : await createViewMutation.mutateAsync(
            buildCreateViewBody(selectedDataSourceId, formValues, accessMode),
          );

      setViewId(savedView.id);
      setHydratedSource(createSourceSummary(savedView) ?? selectedDataSource);
      setHydratedViewId(savedView.id);
      showToast(
        "success",
        viewId ? "Lưu nháp thành công." : "Tạo bản nháp view thành công.",
      );
      await queryClient.invalidateQueries({ queryKey: ["views"] });

      if (goNext) {
        setCurrentStep(3);
        replaceWizardUrl(savedView.id, 3);
      } else {
        replaceWizardUrl(savedView.id, currentStep);
      }

      return savedView;
    } catch (error) {
      showToast("error", getErrorMessage(error, "Không thể lưu nháp view."));
      return null;
    }
  }

  async function handlePublish() {
    let activeViewId = viewId;

    try {
      if (!activeViewId) {
        if (!selectedDataSourceId) {
          showToast("error", "Vui lÃ²ng chá»n nguá»“n dá»¯ liá»‡u.");
          goToStep(1);
          return;
        }

        const errors = validateDraftForm(formValues);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
          showToast("error", "Vui lÃ²ng kiá»ƒm tra láº¡i cáº¥u hÃ¬nh view.");
          goToStep(2);
          return;
        }

        const savedView = await createViewMutation.mutateAsync(
          buildCreateViewBody(selectedDataSourceId, formValues, accessMode),
        );
        activeViewId = savedView.id;
        setViewId(savedView.id);
        setHydratedSource(createSourceSummary(savedView) ?? selectedDataSource);
        setHydratedViewId(savedView.id);
        replaceWizardUrl(savedView.id, 3);
      } else {
        await updateExistingViewSettings(activeViewId);
      }

      if (!activeViewId) {
        return;
      }

      const publishResult = await publishViewMutation.mutateAsync(activeViewId);
      setPublishedUrl(publishResult.url);
      setPublishedSlug(publishResult.slug);
      showToast("success", "Xuất bản view thành công.");
      await queryClient.invalidateQueries({ queryKey: ["views"] });
    } catch (error) {
      showToast("error", getErrorMessage(error, "Không thể xuất bản view."));
    }
  }

  async function handleCopyLink() {
    const url = publishedUrl ?? (publishedSlug ? `/v/${publishedSlug}` : null);
    if (!url) {
      return;
    }

    const absoluteUrl =
      typeof window === "undefined" ? url : new URL(url, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      showToast("success", "Đã copy link view.");
    } catch {
      showToast("error", "Không thể copy link.");
    }
  }

  function handleOpenView() {
    const url = publishedUrl ?? (publishedSlug ? `/v/${publishedSlug}` : null);
    if (!url || typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderStepOne() {
    const errorMessage = dataSourcesQuery.isError
      ? getErrorMessage(
          dataSourcesQuery.error,
          "Không thể tải danh sách nguồn dữ liệu.",
        )
      : null;

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              onChange={handleSearchChange}
              placeholder="Tìm nguồn dữ liệu..."
              type="search"
              value={search}
            />
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)] transition-colors hover:border-blue-800 hover:bg-blue-800"
            onClick={() => setAddModalOpen(true)}
            type="button"
          >
            <PlusIcon className="h-5 w-5" />
            Thêm nguồn dữ liệu mới
          </button>
        </div>

        {sourceLocked ? (
          <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
            View nháp đã được tạo, nguồn dữ liệu hiện tại đang được giữ nguyên.
          </div>
        ) : null}

        {dataSourcesQuery.isPending ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white"
                key={`source-loading-${index}`}
              />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm font-bold text-red-700">{errorMessage}</p>
            <button
              className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
              onClick={() => dataSourcesQuery.refetch()}
              type="button"
            >
              Thử lại
            </button>
          </div>
        ) : dataSources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-base font-bold text-slate-900">
              Chưa có nguồn dữ liệu phù hợp
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Thêm Google Sheet mới để bắt đầu tạo View.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dataSources.map((source) => {
              const selected = source.id === selectedDataSourceId;
              const disabled = sourceLocked && !selected;

              return (
                <button
                  className={`flex min-h-[200px] flex-col rounded-lg border p-4 text-left transition-all ${
                    selected
                      ? "border-blue-700 bg-blue-50 shadow-[0_16px_36px_rgba(30,58,138,0.16)] ring-2 ring-blue-100"
                      : "border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:border-blue-200 hover:bg-blue-50/40"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  disabled={disabled}
                  key={source.id}
                  onClick={() => handleSelectSource(source)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <SheetIcon className="h-5 w-5" />
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selected
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-slate-200 bg-white text-transparent"
                      }`}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-5 min-w-0">
                    <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                      {source.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {getSourceTypeLabel(source.sourceType)} ·{" "}
                      {source.sheetCount} sheet
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <StatusBadge status={source.sourceStatus} />
                    <span className="text-sm font-semibold text-slate-500">
                      {formatDate(source.updatedAt || source.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}

            <button
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-white p-4 text-center text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
              onClick={() => setAddModalOpen(true)}
              type="button"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <PlusIcon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  Thêm nguồn dữ liệu mới
                </span>
                <span className="mt-1 block text-sm font-medium">
                  Kết nối một Google Sheet khác
                </span>
              </span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-medium text-slate-600">
            Đã chọn:{" "}
            <span className="font-bold text-blue-900">
              {selectedDataSource?.title ?? "Chưa chọn nguồn"}
            </span>
          </p>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-6 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedDataSourceId}
            onClick={handleNextFromSource}
            type="button"
          >
            Tiếp tục
          </button>
        </div>
      </section>
    );
  }

  function renderStepTwo() {
    const sheetsErrorMessage = sheetsQuery.isError
      ? getErrorMessage(sheetsQuery.error, "Không thể tải danh sách sheet.")
      : null;

    return (
      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ViewForm
          errors={formErrors}
          isLoadingSheets={sheetsQuery.isPending}
          isPreviewing={previewMutation.isPending}
          onChange={(values) => {
            setFormValues(values);
            setFormErrors({});
          }}
          onPreview={handlePreview}
          onRetrySheets={() => sheetsQuery.refetch()}
          sheets={sheets}
          sheetsErrorMessage={sheetsErrorMessage}
          values={formValues}
        />

        <section className="min-h-[620px] rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bản xem trước trực tiếp
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Kiểm tra header và các dòng dữ liệu mẫu trước khi xuất bản.
              </p>
            </div>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={previewMutation.isPending}
              onClick={handlePreview}
              type="button"
            >
              {previewMutation.isPending ? "Đang tải..." : "Tải lại dữ liệu"}
            </button>
          </div>
          <PreviewTable
            errorMessage={previewError}
            isLoading={previewMutation.isPending}
            preview={preview}
            themePreset={formValues.themePreset}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 xl:col-span-2">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => goToStep(1)}
            type="button"
          >
            Quay lại
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-white px-6 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDraftSaving}
              onClick={() => saveDraft(false)}
              type="button"
            >
              {isDraftSaving ? "Đang lưu..." : "Lưu nháp"}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-6 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDraftSaving}
              onClick={handleContinueFromConfig}
              type="button"
            >
              {isDraftSaving ? "Đang lưu..." : "Tiếp tục"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderStepThree() {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <ViewSummary
          dataSourceTitle={selectedDataSource?.title ?? ""}
          name={formValues.name}
          rangeA1Notation={formValues.rangeA1Notation}
          refreshMode={formValues.refreshMode}
          refreshIntervalSeconds={formValues.refreshIntervalSeconds}
          selectionType={formValues.selectionType}
          sourceSheetName={selectedSheetName}
          themePreset={formValues.themePreset}
        />

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <fieldset>
            <legend className="text-base font-bold text-slate-900">
              Quyền truy cập
            </legend>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  value: "public",
                  title: "Public",
                  description: "Ai có link đều có thể xem.",
                },
                {
                  value: "private",
                  title: "Private",
                  description:
                    "Chỉ user được cấp quyền hoặc có share token hợp lệ mới xem được.",
                },
              ].map((option) => {
                const selected = accessMode === option.value;

                return (
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                      selected
                        ? "border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={selected}
                      className="mt-1 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-700"
                      name="accessMode"
                      onChange={() =>
                        setAccessMode(option.value as ViewAccessMode)
                      }
                      type="radio"
                    />
                    <span>
                      <span className="block text-sm font-bold">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-slate-500">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900">
              Đường dẫn truy cập
            </h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none"
                readOnly
                type="text"
                value={viewUrlLabel}
              />
              {publishedUrl || publishedSlug ? (
                <div className="flex gap-2">
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={handleCopyLink}
                    type="button"
                  >
                    <CopyIcon className="h-5 w-5" />
                    Copy
                  </button>
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                    onClick={handleOpenView}
                    type="button"
                  >
                    <ExternalIcon className="h-5 w-5" />
                    Mở View
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => goToStep(2)}
            type="button"
          >
            Quay lại
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-6 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                publishViewMutation.isPending ||
                updateViewMutation.isPending ||
                updatePublishedViewMutation.isPending
              }
              onClick={handlePublish}
              type="button"
            >
              {publishViewMutation.isPending
                ? "Đang xuất bản..."
                : isEditingPublishedView
                  ? "Lưu & xuất bản lại"
                  : "Xuất bản"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      {toastMessage ? (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-3 rounded-lg border px-5 py-4 text-sm font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${
            toastMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{toastMessage.message}</span>
          <button
            className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/60"
            onClick={() => setToastMessage(null)}
            type="button"
          >
            ×
          </button>
        </div>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tạo View mới</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Chọn nguồn dữ liệu để bắt đầu tạo trang chia sẻ
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          onClick={() => router.push("/owner/views")}
          type="button"
        >
          Hủy bỏ
        </button>
      </header>

      <ViewStepper currentStep={currentStep} />

      {viewQuery.isPending && viewId ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-8 text-center text-sm font-semibold text-slate-500">
          Đang khôi phục bản nháp...
        </div>
      ) : viewQuery.isError && viewId ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-base font-bold text-red-700">
            {getErrorMessage(viewQuery.error, "Không thể tải bản nháp view.")}
          </p>
          <button
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
            onClick={() => viewQuery.refetch()}
            type="button"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {currentStep === 1 ? renderStepOne() : null}
          {currentStep === 2 ? renderStepTwo() : null}
          {currentStep === 3 ? renderStepThree() : null}
        </>
      )}

      <AddDataSourceModal
        isSubmitting={createDataSourceMutation.isPending}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateDataSource}
        open={addModalOpen}
      />
    </section>
  );
}
