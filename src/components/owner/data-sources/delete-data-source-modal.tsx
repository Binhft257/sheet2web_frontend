"use client";

import type { DataSource } from "@/src/types/data-source";
import type { SVGProps } from "react";

type DeleteDataSourceModalProps = {
  open: boolean;
  dataSource: DataSource | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

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

export default function DeleteDataSourceModal({
  open,
  dataSource,
  isSubmitting = false,
  onClose,
  onConfirm,
}: DeleteDataSourceModalProps) {
  if (!open || !dataSource) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <button
        aria-label="Đóng modal"
        className="absolute inset-0 cursor-default"
        disabled={isSubmitting}
        onClick={onClose}
        type="button"
      />

      <section className="relative w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-6">
          <h2 className="text-lg font-bold text-slate-900">Xóa nguồn dữ liệu</h2>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm font-medium text-slate-600">
            Bạn chắc chắn muốn xóa nguồn{" "}
            <span className="font-bold text-slate-900">{dataSource.title}</span>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Hủy
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-red-700 bg-red-700 px-6 text-sm font-bold text-white transition-colors hover:border-red-800 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => {
                void onConfirm();
              }}
              type="button"
            >
              {isSubmitting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
