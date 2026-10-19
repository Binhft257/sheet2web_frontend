import type { DataSource } from "@/src/types/data-source";
import AppLink from "@/src/components/app-link";
import type { ReactElement, SVGProps } from "react";
import EmptyState from "@/src/components/common/empty-state";
import StatusBadge, { type StatusTone } from "@/src/components/common/status-badge";

type SourceStatusTableProps = {
  dataSources: DataSource[];
  isLoading?: boolean;
  errorMessage?: string | null;
};

type StatusPresentation = {
  label: string;
  tone: StatusTone;
};

type SourceTypePresentation = {
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

const MAX_VISIBLE_SOURCES = 5;

const statusMap: Record<string, StatusPresentation> = {
  active: {
    label: "Hoạt động",
    tone: "success",
  },
  inactive: {
    label: "Tạm dừng",
    tone: "neutral",
  },
  syncing: {
    label: "Đang đồng bộ",
    tone: "info",
  },
  error: {
    label: "Lỗi",
    tone: "danger",
  },
  draft: {
    label: "Bản nháp",
    tone: "warning",
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
      tone: "neutral",
    }
  );
}

function getSourceTypePresentation(sourceType: string): SourceTypePresentation {
  const normalized = sourceType.trim().toLowerCase();

  if (normalized === "google_sheet" || normalized === "google sheets") {
    return {
      label: "Google Sheets",
      icon: SheetIcon,
    };
  }

  if (normalized === "csv") {
    return {
      label: "CSV Upload",
      icon: FileIcon,
    };
  }

  if (normalized === "excel") {
    return {
      label: "Excel",
      icon: FileIcon,
    };
  }

  return {
    label: sourceType || "Nguồn dữ liệu",
    icon: FileIcon,
  };
}

function LoadingBody() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={`row-loading-${rowIndex}`} aria-hidden="true">
          <td>
            <div className="flex items-center gap-3">
              <span className="ui-skeleton h-11 w-10 shrink-0" />
              <span className="space-y-2"><span className="ui-skeleton h-4 w-36" /><span className="ui-skeleton h-3 w-16" /></span>
            </div>
          </td>
          <td><span className="ui-skeleton h-5 w-24" /></td>
          <td><span className="ui-skeleton h-5 w-24" /></td>
          <td><span className="ui-skeleton h-7 w-24" /></td>
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
    <section className="ui-panel" aria-labelledby="source-status-heading" aria-busy={isLoading}>
      <div className="ui-panel-header">
        <div>
          <h2 id="source-status-heading">Trạng thái kết nối nguồn</h2>
          <p>Các nguồn dữ liệu trong không gian làm việc của bạn.</p>
        </div>
        <AppLink className="ui-link" href="/owner/data-sources">Xem tất cả</AppLink>
      </div>

      {!isLoading && errorMessage ? (
        <EmptyState title="Không thể tải nguồn dữ liệu" description={errorMessage} icon={<FileIcon />} />
      ) : !isLoading && visibleDataSources.length === 0 ? (
        <EmptyState
          title="Chưa có nguồn dữ liệu nào"
          description="Kết nối Google Sheets trong mục Nguồn dữ liệu để bắt đầu tạo view."
          icon={<SheetIcon />}
        />
      ) : (
        <>
          {isLoading ? <span className="sr-only" role="status">Đang tải nguồn dữ liệu</span> : null}
          <div className="ui-table-region" tabIndex={0} role="region" aria-label="Bảng trạng thái nguồn dữ liệu, có thể cuộn ngang">
            <table className="ui-table">
              <caption className="sr-only">Trạng thái kết nối của tối đa 5 nguồn dữ liệu hiện tại</caption>
              <thead>
                <tr>
                  <th scope="col">Tên nguồn</th>
                  <th scope="col">Loại</th>
                  <th scope="col">Cập nhật cuối</th>
                  <th scope="col">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <LoadingBody /> : visibleDataSources.map((source) => {
                  const status = getStatusPresentation(source.sourceStatus);
                  const type = getSourceTypePresentation(source.sourceType);
                  const TypeIcon = type.icon;
                  const lastUpdatedAt = source.lastSyncedStructureAt ?? source.updatedAt ?? null;

                  return (
                    <tr key={source.id}>
                      <td>
                        <div className="flex min-w-[200px] items-center gap-3">
                          <span className="ui-source-icon"><TypeIcon /></span>
                          <div className="min-w-0 max-w-80">
                            <p className="font-medium break-words text-ink">{source.title}</p>
                            <p className="mt-1 text-xs text-muted">{source.sheetCount} sheet</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="whitespace-nowrap">{type.label}</span></td>
                      <td><span className="whitespace-nowrap" title={formatDateTime(lastUpdatedAt)}>{formatRelativeDateTime(lastUpdatedAt)}</span></td>
                      <td><StatusBadge tone={status.tone}>{status.label}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-xs text-muted sm:hidden">Cuộn ngang để xem đầy đủ thông tin.</p>
        </>
      )}
    </section>
  );
}
