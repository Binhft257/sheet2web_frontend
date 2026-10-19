"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Preserve existing draft hydration and initial sheet selection. */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  DataSource,
  DataSourcePreview,
  CreateDataSourceBody,
} from "@/src/types/data-source";
import type { ViewAccessMode } from "@/src/types/view";
import type { ReloadMode } from "@/src/components/viewer/shared-view-render";
import type {
  WizardStep,
  CreateViewWizardProps,
  SourceSummary,
  ViewDraftFormValues,
  ViewDraftFormErrors,
} from "@/src/features/owner/views/wizard-types";
import type { ViewToast } from "@/src/features/owner/views/types";
import {
  DEFAULT_FORM_VALUES,
  DATA_SOURCES_LIMIT,
  MIN_PREVIEW_REFRESH_INTERVAL_SECONDS,
} from "@/src/features/owner/views/wizard-constants";
import {
  getErrorMessage,
  getThemePreset,
} from "@/src/features/owner/views/view-utils";
import {
  replaceWizardUrl,
  createSourceSummary,
  validateDraftForm,
  buildCreateViewBody,
  buildUpdateViewBody,
} from "@/src/features/owner/views/wizard-utils";
import { appPath } from "@/src/lib/app-path";
import usePreviewRefresh from "@/src/features/owner/views/hooks/use-preview-refresh";

export default function useViewWizard({
  initialStep = 1,
  initialViewId = null,
}: CreateViewWizardProps) {
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
  const [previewReloadMode, setPreviewReloadMode] =
    useState<ReloadMode>("manual");
  const [previewIntervalSeconds, setPreviewIntervalSeconds] = useState(
    MIN_PREVIEW_REFRESH_INTERVAL_SECONDS,
  );
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<ViewToast | null>(null);
  const [hydratedViewId, setHydratedViewId] = useState<string | null>(null);

  const dataSourcesQuery = useDataSources({
    page: 1,
    limit: DATA_SOURCES_LIMIT,
    search,
  });
  const sheetsQuery = useDataSourceSheets(selectedDataSourceId || null);
  const viewQuery = useView(viewId);
  const { mutateAsync: previewDataSource, isPending: isPreviewing } =
    usePreviewDataSource(selectedDataSourceId || null);
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
    selectedSheet?.sheetName ?? viewQuery.data?.sourceSheet?.sheetName ?? "";
  const isDraftSaving =
    createViewMutation.isPending ||
    updateViewMutation.isPending ||
    updatePublishedViewMutation.isPending;
  const sourceLocked = Boolean(viewId);
  const isEditingPublishedView =
    viewQuery.data?.status === "published" ||
    Boolean(publishedSlug || publishedUrl);

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
      themePreset: getThemePreset(view.themeOverrideJson),
    });
    setAccessMode(view.accessMode === "private" ? "private" : "public");
    setPublishedSlug(view.status === "published" ? view.slug : null);
    setPublishedUrl(
      view.status === "published" ? appPath(`/v/${view.slug}`) : null,
    );
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
      return appPath(`/v/${publishedSlug}`);
    }

    return "Sẽ có sau khi xuất bản";
  }, [publishedSlug, publishedUrl]);

  function showToast(type: ViewToast["type"], message: string) {
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

  const handlePreview = useCallback(async () => {
    if (!selectedDataSourceId) {
      setToastMessage({
        type: "error",
        message: "Vui lòng chọn nguồn dữ liệu.",
      });
      setCurrentStep(1);
      replaceWizardUrl(viewId, 1);
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
      setToastMessage({
        type: "error",
        message: "Vui lòng kiểm tra cấu hình preview.",
      });
      return;
    }

    setPreviewError(null);

    try {
      const result = await previewDataSource({
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
      setToastMessage({ type: "error", message });
    }
  }, [formValues, previewDataSource, selectedDataSourceId, viewId]);

  const previewRemainingSeconds = usePreviewRefresh({
    currentStep,
    previewReloadMode,
    previewIntervalSeconds,
    handlePreview,
  });

  function handleContinueFromConfig() {
    if (!selectedDataSourceId) {
      showToast("error", "Vui lòng chọn nguồn dữ liệu.");
      goToStep(1);
      return;
    }

    const errors = validateDraftForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast("error", "Vui lòng kiểm tra lại cấu hình view.");
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
          showToast("error", "Vui lòng chọn nguồn dữ liệu.");
          goToStep(1);
          return;
        }

        const errors = validateDraftForm(formValues);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
          showToast("error", "Vui lòng kiểm tra lại cấu hình view.");
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
      setPublishedUrl(appPath(publishResult.url));
      setPublishedSlug(publishResult.slug);
      showToast("success", "Xuất bản view thành công.");
      await queryClient.invalidateQueries({ queryKey: ["views"] });
    } catch (error) {
      showToast("error", getErrorMessage(error, "Không thể xuất bản view."));
    }
  }

  async function handleCopyLink() {
    const url =
      publishedUrl ?? (publishedSlug ? appPath(`/v/${publishedSlug}`) : null);
    if (!url) {
      return;
    }

    const absoluteUrl =
      typeof window === "undefined"
        ? url
        : new URL(url, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      showToast("success", "Đã copy link view.");
    } catch {
      showToast("error", "Không thể copy link.");
    }
  }

  function handleOpenView() {
    const url =
      publishedUrl ?? (publishedSlug ? appPath(`/v/${publishedSlug}`) : null);
    if (!url || typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return {
    currentStep,
    viewId,
    dataSources,
    selectedDataSourceId,
    selectedDataSource,
    sourceLocked,
    search,
    isSourcesLoading: dataSourcesQuery.isPending,
    sourcesError: dataSourcesQuery.isError
      ? getErrorMessage(
          dataSourcesQuery.error,
          "Không thể tải danh sách nguồn dữ liệu.",
        )
      : null,
    retrySources: () => dataSourcesQuery.refetch(),
    isHydrating: viewQuery.isPending && Boolean(viewId),
    hydrationError:
      viewQuery.isError && viewId
        ? getErrorMessage(viewQuery.error, "Không thể tải bản nháp view.")
        : null,
    retryView: () => viewQuery.refetch(),
    sheets,
    selectedSheetName,
    isLoadingSheets: sheetsQuery.isPending,
    sheetsError: sheetsQuery.isError
      ? getErrorMessage(sheetsQuery.error, "Không thể tải danh sách sheet.")
      : null,
    retrySheets: () => sheetsQuery.refetch(),
    formValues,
    formErrors,
    changeForm: (values: ViewDraftFormValues) => {
      setFormValues(values);
      setFormErrors({});
    },
    accessMode,
    setAccessMode,
    preview,
    previewError,
    isPreviewing,
    previewReloadMode,
    setPreviewReloadMode,
    previewIntervalSeconds,
    previewRemainingSeconds,
    changePreviewInterval: (seconds: number) =>
      setPreviewIntervalSeconds(
        Math.max(
          MIN_PREVIEW_REFRESH_INTERVAL_SECONDS,
          Number(seconds) || MIN_PREVIEW_REFRESH_INTERVAL_SECONDS,
        ),
      ),
    isDraftSaving,
    isEditingPublishedView,
    isPublishPending: publishViewMutation.isPending,
    isPublishDisabled:
      publishViewMutation.isPending ||
      updateViewMutation.isPending ||
      updatePublishedViewMutation.isPending,
    hasPublishedLink: Boolean(publishedUrl || publishedSlug),
    viewUrlLabel,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    addModalOpen,
    openAddModal: () => setAddModalOpen(true),
    closeAddModal: () => setAddModalOpen(false),
    isCreatingSource: createDataSourceMutation.isPending,
    handleSelectSource,
    handleSearchChange,
    handleCreateDataSource,
    handleNextFromSource,
    handlePreview,
    handleContinueFromConfig,
    saveDraft,
    handlePublish,
    handleCopyLink,
    handleOpenView,
    goToStep,
  };
}
export type ViewWizardState = ReturnType<typeof useViewWizard>;
