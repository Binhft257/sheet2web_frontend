import StatusBadge from "@/src/components/owner/data-sources/status-badge";
import type { DataSource } from "@/src/types/data-source";
import type { SVGProps } from "react";

type DataSourcesTableProps = {
  dataSources: DataSource[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
  onEdit: (dataSource: DataSource) => void;
  onDelete: (dataSource: DataSource) => void;
  updatingId?: string | null;
  deletingId?: string | null;
};

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

function getSourceTypeLabel(sourceType: string) {
  const normalized = sourceType.trim().toLowerCase();

  if (normalized === "google_sheet") {
    return "Google Sheet";
  }

  return sourceType || "Google Sheet";
}

function formatDateTime(dateTime: string) {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr className="border-b border-slate-100" key={`source-loading-${index}`}>
          <td className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-md bg-slate-200" />
              <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-9 w-36 animate-pulse rounded bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function DataSourcesTable({
  dataSources,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onEdit,
  onDelete,
  updatingId = null,
  deletingId = null,
}: DataSourcesTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left">
          <thead className="bg-[#f5f5fa]">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Tên nguồn</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Loại nguồn</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Số sheet</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Trạng thái</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Thời gian đăng</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Lỗi nếu có</th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">Hành động</th>
            </tr>
          </thead>

          <tbody className="text-sm text-slate-700">
            {isLoading ? (
              <LoadingRows />
            ) : errorMessage ? (
              <tr>
                <td className="px-6 py-14 text-center" colSpan={7}>
                  <div className="mx-auto max-w-md">
                    <p className="text-base font-bold text-slate-900">
                      Không thể tải danh sách nguồn dữ liệu
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-500">{errorMessage}</p>
                    <button
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                      onClick={onRetry}
                      type="button"
                    >
                      Thử lại
                    </button>
                  </div>
                </td>
              </tr>
            ) : dataSources.length === 0 ? (
              <tr>
                <td className="px-6 py-16 text-center" colSpan={7}>
                  <div className="mx-auto max-w-md">
                    <p className="text-base font-bold text-slate-900">Chưa có nguồn dữ liệu nào</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Bấm Thêm nguồn mới để kết nối Google Sheet đầu tiên
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              dataSources.map((item) => (
                <tr
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  key={item.id}
                >
                  <td className="px-6 py-5">
                    <div className="flex min-w-[260px] items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                        <SheetIcon className="h-5 w-5" />
                      </span>
                      <p className="truncate font-semibold text-slate-900">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-700">
                    {getSourceTypeLabel(item.sourceType)}
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-700">{item.sheetCount} sheet</td>
                  <td className="px-6 py-5">
                    <StatusBadge status={item.sourceStatus} />
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="max-w-[320px] px-6 py-5">
                    {item.lastError ? (
                      <p className="line-clamp-2 text-sm font-semibold text-red-700">{item.lastError}</p>
                    ) : (
                      <span className="font-medium text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(deletingId) || updatingId === item.id}
                        onClick={() => onEdit(item)}
                        type="button"
                      >
                        {updatingId === item.id ? "Đang sửa..." : "Sửa"}
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(updatingId) || deletingId === item.id}
                        onClick={() => onDelete(item)}
                        type="button"
                      >
                        {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
