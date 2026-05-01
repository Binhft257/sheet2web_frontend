import type { DataSource } from "@/src/types/data-source";
import Link from "next/link";
import type { ReactElement, SVGProps } from "react";

type SourceStatusTableProps = {
  dataSources: DataSource[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

type StatusPresentation = {
  label: string;
  className: string;
  dotClassName: string;
};

type SourceTypePresentation = {
  label: string;
  className: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

const MAX_VISIBLE_SOURCES = 5;

const statusMap: Record<string, StatusPresentation> = {
  active: {
    label: "Hoạt động",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  inactive: {
    label: "Tạm dừng",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dotClassName: "bg-slate-500",
  },
  syncing: {
    label: "Đang đồng bộ",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dotClassName: "bg-blue-500",
  },
  error: {
    label: "Lỗi",
    className: "bg-brown-50 text-brown-700 ring-1 ring-brown-200",
    dotClassName: "bg-brown-500",
  },
  draft: {
    label: "Bản nháp",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dotClassName: "bg-amber-500",
  },
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

function FileIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function formatDateTime(dateTime: string | null) {
  if (!dateTime) {
    return "--";
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function formatRelativeDateTime(dateTime: string | null) {
  if (!dateTime) {
    return "--";
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  const diffInSeconds = Math.round((parsed.getTime() - Date.now()) / 1000);
  const absoluteDiffInSeconds = Math.abs(diffInSeconds);
  const formatter = new Intl.RelativeTimeFormat("vi-VN", {
    numeric: "auto",
  });

  if (absoluteDiffInSeconds < 60) {
    return formatter.format(diffInSeconds, "second");
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return formatter.format(diffInDays, "day");
  }

  return formatDateTime(dateTime);
}

function getStatusPresentation(status: string): StatusPresentation {
  const normalized = status.trim().toLowerCase();
  return (
    statusMap[normalized] ?? {
      label: status || "Không xác định",
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      dotClassName: "bg-slate-500",
    }
  );
}

function getSourceTypePresentation(sourceType: string): SourceTypePresentation {
  const normalized = sourceType.trim().toLowerCase();

  if (normalized === "google_sheet" || normalized === "google sheets") {
    return {
      label: "Google Sheets",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      icon: SheetIcon,
    };
  }

  if (normalized === "csv") {
    return {
      label: "CSV Upload",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      icon: FileIcon,
    };
  }

  if (normalized === "excel") {
    return {
      label: "Excel",
      className: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      icon: FileIcon,
    };
  }

  return {
    label: sourceType || "Nguồn dữ liệu",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    icon: FileIcon,
  };
}

function LoadingBody() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr className="border-b border-slate-100" key={`row-loading-${index}`}>
          <td className="px-6 py-5">
            <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-8 w-36 animate-pulse rounded-full bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-6 py-5">
            <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function SourceStatusTable({
  dataSources,
  isLoading = false,
  errorMessage = null,
}: SourceStatusTableProps) {
  const visibleDataSources = dataSources.slice(0, MAX_VISIBLE_SOURCES);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">
          Trạng thái kết nối nguồn
        </h2>
        <Link
          className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800"
          href="/owner/data-sources"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#f5f5fa]">
            <tr className="border-b border-slate-100">
              <th className="px-6 py-5 text-sm font-bold text-slate-500">
                Tên nguồn
              </th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">
                Loại
              </th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">
                Cập nhật cuối
              </th>
              <th className="px-6 py-5 text-sm font-bold text-slate-500">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700">
            {isLoading ? (
              <LoadingBody />
            ) : errorMessage ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-brown-700" colSpan={4}>
                  {errorMessage}
                </td>
              </tr>
            ) : visibleDataSources.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={4}>
                  Chưa có nguồn dữ liệu nào.
                </td>
              </tr>
            ) : (
              visibleDataSources.map((source) => {
                const status = getStatusPresentation(source.sourceStatus);
                const type = getSourceTypePresentation(source.sourceType);
                const TypeIcon = type.icon;
                const lastUpdatedAt =
                  source.lastSyncedStructureAt ?? source.updatedAt ?? null;

                return (
                  <tr
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    key={source.id}
                  >
                    <td className="px-6 py-5">
                      <div className="flex min-w-[280px] items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                          <TypeIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {source.title}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-400">
                            {source.sheetCount} sheet
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${type.className}`}
                      >
                        {type.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-500">
                      {formatRelativeDateTime(lastUpdatedAt)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold ${status.className}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${status.dotClassName}`} />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
