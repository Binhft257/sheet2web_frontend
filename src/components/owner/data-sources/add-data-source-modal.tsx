"use client";

import type { ChangeEvent, FocusEvent, FormEvent, SVGProps } from "react";
import { useState } from "react";
import { z } from "zod";

type AddDataSourceModalProps = {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: { sourceUrl: string; title?: string }) => Promise<void>;
};

const addDataSourceSchema = z.object({
  title: z.string(),
  sourceUrl: z.string().trim().min(1, "Vui lòng nhập Google Sheet URL"),
});

type AddDataSourceValues = z.infer<typeof addDataSourceSchema>;
type AddDataSourceField = keyof AddDataSourceValues;
type AddDataSourceErrors = Partial<Record<AddDataSourceField, string>>;

const initialValues: AddDataSourceValues = {
  title: "",
  sourceUrl: "",
};

function mapErrors(
  error: z.ZodError<AddDataSourceValues>,
): AddDataSourceErrors {
  const nextErrors: AddDataSourceErrors = {};

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

export default function AddDataSourceModal({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddDataSourceModalProps) {
  const [values, setValues] = useState<AddDataSourceValues>(initialValues);
  const [errors, setErrors] = useState<AddDataSourceErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function resetForm() {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as AddDataSourceField;
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

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const field = event.target.name as AddDataSourceField;
    if (field !== "title" && field !== "sourceUrl") {
      return;
    }

    const fieldResult = addDataSourceSchema.shape[field].safeParse(
      event.target.value,
    );

    setErrors((previous) => ({
      ...previous,
      [field]: fieldResult.success
        ? undefined
        : fieldResult.error.issues[0]?.message,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = addDataSourceSchema.safeParse(values);
    if (!result.success) {
      setErrors(mapErrors(result.error));
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);

    try {
      await onSubmit({
        sourceUrl: result.data.sourceUrl,
        title: result.data.title.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Không thể thêm nguồn dữ liệu.",
      );
    }
  }

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
          <h2 className="text-lg font-bold text-slate-900">
            Thêm nguồn dữ liệu mới
          </h2>
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
              onBlur={handleBlur}
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
              onBlur={handleBlur}
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
              {isSubmitting ? "Đang kết nối..." : "Kết nối"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
