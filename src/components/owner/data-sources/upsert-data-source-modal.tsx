"use client";

import type {
  CreateDataSourceBody,
  DataSource,
  UpdateDataSourceBody,
} from "@/src/types/data-source";
import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import Modal from "@/src/components/common/modal";
import { SharedButton } from "@/src/components/share";
import { z } from "zod";

type UpsertDataSourceModalMode = "create" | "edit";

type UpsertDataSourceModalProps = {
  open: boolean;
  mode: UpsertDataSourceModalMode;
  dataSource?: DataSource | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (
    values: CreateDataSourceBody | UpdateDataSourceBody,
  ) => Promise<void>;
};

const formSchema = z.object({
  title: z.string(),
  sourceUrl: z.string().trim().min(1, "Vui lòng nhập Google Sheet URL"),
});

type FormValues = z.infer<typeof formSchema>;
type FormField = keyof FormValues;
type FormErrors = Partial<Record<FormField, string>>;

const initialValues: FormValues = {
  title: "",
  sourceUrl: "",
};

function mapErrors(error: z.ZodError<FormValues>): FormErrors {
  const nextErrors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "title" || field === "sourceUrl") && !nextErrors[field]) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getInitialSourceUrl(dataSource?: DataSource | null) {
  const sourceUrl = dataSource?.sourceUrl?.trim();
  if (sourceUrl) {
    return sourceUrl;
  }

  const spreadsheetId = dataSource?.spreadsheetId?.trim();
  if (spreadsheetId) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  }

  return "";
}

export default function UpsertDataSourceModal({
  open,
  mode,
  dataSource = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}: UpsertDataSourceModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: mode === "edit" ? (dataSource?.title ?? "") : initialValues.title,
    sourceUrl:
      mode === "edit"
        ? getInitialSourceUrl(dataSource)
        : initialValues.sourceUrl,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sourceUrlRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setErrors({});
    setSubmitError(null);
    onClose();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as FormField;
    if (field !== "title" && field !== "sourceUrl") {
      return;
    }

    setValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = formSchema.safeParse(values);
    if (!result.success) {
      setErrors(mapErrors(result.error));
      setSubmitError(null);
      sourceUrlRef.current?.focus();
      return;
    }

    const normalizedSourceUrl = result.data.sourceUrl.trim();
    if (!isValidHttpUrl(normalizedSourceUrl)) {
      setErrors({ sourceUrl: "Google Sheet URL không hợp lệ" });
      setSubmitError(null);
      sourceUrlRef.current?.focus();
      return;
    }

    const normalizedTitle = result.data.title.trim();

    setErrors({});
    setSubmitError(null);

    try {
      await onSubmit({
        sourceUrl: normalizedSourceUrl,
        title: normalizedTitle || undefined,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : mode === "create"
            ? "Không thể thêm nguồn dữ liệu."
            : "Không thể cập nhật nguồn dữ liệu.",
      );
    }
  }

  const isEditMode = mode === "edit";
  const titleText = isEditMode ? "Sửa nguồn dữ liệu" : "Thêm nguồn dữ liệu mới";
  const submitText = isEditMode ? "Cập nhật" : "Kết nối";
  const loadingText = isEditMode ? "Đang cập nhật..." : "Đang kết nối...";

  return (
    <Modal
      open={open}
      title={titleText}
      description={
        isEditMode
          ? "Cập nhật tên và liên kết của nguồn dữ liệu."
          : "Kết nối bảng tính để sử dụng dữ liệu trong các view của bạn."
      }
      busy={isSubmitting}
      onClose={handleClose}
    >
      <form
        className="ui-modal-form"
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="ui-modal-body space-y-5">
          {submitError ? (
            <p className="ui-alert" role="alert">
              {submitError}
            </p>
          ) : null}
          <div>
            <label className="ui-field-label" htmlFor="data-source-title">
              Tên nguồn{" "}
              <span className="font-normal text-muted">(không bắt buộc)</span>
            </label>
            <input
              className="ui-form-control"
              disabled={isSubmitting}
              id="data-source-title"
              name="title"
              onChange={handleChange}
              placeholder="Ví dụ: Danh mục sản phẩm"
              type="text"
              value={values.title}
            />
          </div>
          <div>
            <label className="ui-field-label" htmlFor="data-source-url">
              Liên kết Google Sheets
            </label>
            <input
              ref={sourceUrlRef}
              aria-describedby={
                errors.sourceUrl
                  ? "data-source-url-error data-source-url-help"
                  : "data-source-url-help"
              }
              aria-invalid={Boolean(errors.sourceUrl)}
              className="ui-form-control"
              disabled={isSubmitting}
              id="data-source-url"
              name="sourceUrl"
              onChange={handleChange}
              placeholder="https://docs.google.com/spreadsheets/…"
              type="url"
              value={values.sourceUrl}
            />
            <p className="ui-field-help" id="data-source-url-help">
              Bảng tính cần cho phép xem công khai hoặc qua liên kết.
            </p>
            {errors.sourceUrl ? (
              <p
                className="ui-field-error"
                id="data-source-url-error"
                role="alert"
              >
                {errors.sourceUrl}
              </p>
            ) : null}
          </div>
        </div>
        <div className="ui-modal-footer">
          <SharedButton
            variant="outlined"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Hủy
          </SharedButton>
          <SharedButton disabled={isSubmitting} type="submit">
            {isSubmitting ? loadingText : submitText}
          </SharedButton>
        </div>
      </form>
    </Modal>
  );
}
