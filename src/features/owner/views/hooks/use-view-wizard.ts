"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Preserve existing draft hydration and initial sheet selection. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
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
  ViewPublication,
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
import { appPath, replaceAppPath } from "@/src/lib/app-path";
import { viewDetailPath } from "@/src/features/owner/views/view-navigation";
import usePreviewRefresh from "@/src/features/owner/views/hooks/use-preview-refresh";

export default function useViewWizard({
  initialStep = 1,
  initialViewId = null,
  initialCompleted = false,
  returnTo,
}: CreateViewWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const publishLock = useRef(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [completedPublication, setCompletedPublication] =
    useState<ViewPublication | null>(null);
  const [isEditingExistingView] = useState(Boolean(initialViewId));
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
  const publication: ViewPublication | null =
    completedPublication ??
    (initialCompleted && viewQuery.data?.status === "published"
      ? {
          viewId: viewQuery.data.id,
          slug: viewQuery.data.slug,
          name: viewQuery.data.name,
          url: appPath(`/v/${viewQuery.data.slug}`),
          accessMode: viewQuery.data.accessMode,
        }
      : null);

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
    if (isEditingPublishedView || publishLock.current) return null;

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
        ? await updateViewMutation.mutateAsync({
            id: viewId,
            body: buildUpdateViewBody(formValues, accessMode),
          })
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
    if (publishLock.current || isDraftSaving || publication) return;

    publishLock.current = true;
    setIsPublishing(true);
    let activeViewId = viewId;
    let didComplete = false;

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
      await queryClient.invalidateQueries({ queryKey: ["views"] });
      if (isEditingExistingView) {
        replaceAppPath(router, viewDetailPath(activeViewId, returnTo, true));
      } else {
        setCompletedPublication({
          viewId: activeViewId,
          slug: publishResult.slug,
          name: formValues.name.trim(),
          url: appPath(publishResult.url),
          accessMode,
        });
        setToastMessage(null);
        replaceWizardUrl(activeViewId, 3, true);
      }
      didComplete = true;
    } catch (error) {
      showToast("error", getErrorMessage(error, "Không thể xuất bản view."));
    } finally {
      if (!didComplete) publishLock.current = false;
      if (!didComplete || !isEditingExistingView) setIsPublishing(false);
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
      showToast("success", "Đã sao chép link truy cập.");
    } catch {
      showToast("error", "Không thể sao chép link. Vui lòng thử lại.");
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
    isEditingExistingView,
    publication,
    isPublishPending: isPublishing,
    isPublishDisabled:
      isPublishing ||
      Boolean(publication) ||
      createViewMutation.isPending ||
      publishViewMutation.isPending ||
      updateViewMutation.isPending ||
      updatePublishedViewMutation.isPending,
    hasPublishedLink: Boolean(publishedUrl || publishedSlug),
    viewUrlLabel,
    toastMessage,
    showToast,
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
