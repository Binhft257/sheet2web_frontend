"use client";

import type {
  CreateDataSourceBody,
  DataSource,
  UpdateDataSourceBody,
} from "@/src/types/data-source";
import type { ChangeEvent, FormEvent, SVGProps } from "react";
import { useState } from "react";
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

function CloseIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
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
    title: mode === "edit" ? dataSource?.title ?? "" : initialValues.title,
    sourceUrl:
      mode === "edit"
        ? getInitialSourceUrl(dataSource)
        : initialValues.sourceUrl,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      return;
    }

    const normalizedSourceUrl = result.data.sourceUrl.trim();
    if (!isValidHttpUrl(normalizedSourceUrl)) {
      setErrors({ sourceUrl: "Google Sheet URL không hợp lệ" });
      setSubmitError(null);
      return;
    }

    const normalizedTitle = result.data.title.trim();

    setErrors({});
    setSubmitError(null);

    try {
      if (mode === "create") {
        await onSubmit({
          sourceUrl: normalizedSourceUrl,
          title: normalizedTitle || undefined,
        });
      } else {
        await onSubmit({
          sourceUrl: normalizedSourceUrl,
          title: normalizedTitle || undefined,
        });
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <button
        aria-label="Đóng modal"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        type="button"
      />

      <section className="relative w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">
          <h2 className="text-lg font-bold text-slate-900">{titleText}</h2>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-5 px-6 py-6"
          method="post"
          noValidate
          onSubmit={handleSubmit}
        >
          {submitError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </p>
          ) : null}

          <label className="block" htmlFor="data-source-title">
            <span className="text-sm font-bold text-slate-700">
              Tên nguồn{" "}
              <span className="font-medium text-slate-400">
                (không bắt buộc)
              </span>
            </span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              disabled={isSubmitting}
              id="data-source-title"
              name="title"
              onChange={handleChange}
              placeholder="Ví dụ: Bảng điểm lớp A"
              type="text"
              value={values.title}
            />
          </label>

          <label className="block" htmlFor="data-source-url">
            <span className="text-sm font-bold text-slate-700">
              Google Sheet URL
            </span>
            <input
              aria-describedby={
                errors.sourceUrl ? "data-source-url-error" : undefined
              }
              aria-invalid={Boolean(errors.sourceUrl)}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              disabled={isSubmitting}
              id="data-source-url"
              name="sourceUrl"
              onChange={handleChange}
              placeholder="Dán link Google Sheet public/share-by-link"
              type="url"
              value={values.sourceUrl}
            />
            {errors.sourceUrl ? (
              <p
                className="mt-1.5 text-sm text-brown-600"
                id="data-source-url-error"
              >
                {errors.sourceUrl}
              </p>
            ) : null}
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={handleClose}
              type="button"
            >
              Hủy
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-6 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? loadingText : submitText}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
