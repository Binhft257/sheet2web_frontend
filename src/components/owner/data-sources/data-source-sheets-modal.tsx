"use client";

import type { DataSource, DataSourceSheet } from "@/src/types/data-source";
import type { SVGProps } from "react";

type DataSourceSheetsModalProps = {
  open: boolean;
  dataSource: DataSource | null;
  sheets: DataSourceSheet[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onRetry: () => void;
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

function getSheetName(sheet: DataSourceSheet, index: number) {
  return sheet.sheetName ?? sheet.title ?? `Sheet ${index + 1}`;
}

export default function DataSourceSheetsModal({
  open,
  dataSource,
  sheets,
  isLoading = false,
  errorMessage = null,
  onClose,
  onRetry,
}: DataSourceSheetsModalProps) {
  if (!open || !dataSource) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <button
        aria-label="Đóng modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <section className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">Danh sách sheet</h2>
            <p className="mt-1 truncate text-sm font-medium text-slate-500">
              {dataSource.title}
            </p>
          </div>
          <button
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="h-14 animate-pulse rounded-md bg-slate-100"
                  key={`sheet-loading-${index}`}
                />
              ))}
            </div>
          ) : errorMessage ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
              <button
                className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                onClick={onRetry}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : sheets.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
              Nguồn này chưa có sheet nào.
            </p>
          ) : (
            <ul className="space-y-2">
              {sheets.map((sheet, index) => (
                <li
                  className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
                  key={`${getSheetName(sheet, index)}-${index}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <SheetIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {getSheetName(sheet, index)}
                    </p>
                    {typeof sheet.rowCount === "number" ||
                    typeof sheet.columnCount === "number" ? (
                      <p className="mt-0.5 text-sm font-medium text-slate-500">
                        {typeof sheet.rowCount === "number"
                          ? `${sheet.rowCount} dòng`
                          : ""}
                        {typeof sheet.rowCount === "number" &&
                        typeof sheet.columnCount === "number"
                          ? " · "
                          : ""}
                        {typeof sheet.columnCount === "number"
                          ? `${sheet.columnCount} cột`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
