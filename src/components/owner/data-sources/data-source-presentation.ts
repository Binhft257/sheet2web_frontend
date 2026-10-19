import type { StatusTone } from "@/src/components/common/status-badge";
import type {
  DataSourceStatus,
  DataSourceStatusFilter,
} from "@/src/types/data-source";

type StatusPresentation = { label: string; tone: StatusTone };

const statusMap: Record<DataSourceStatusFilter, StatusPresentation> = {
  active: { label: "Hoạt động", tone: "success" },
  error: { label: "Lỗi", tone: "danger" },
  disconnected: { label: "Ngắt kết nối", tone: "neutral" },
};

export const DATA_SOURCE_STATUS_OPTIONS = (
  Object.keys(statusMap) as DataSourceStatusFilter[]
).map((value) => ({ value, label: statusMap[value].label }));

export function getDataSourceStatusPresentation(
  status: DataSourceStatus,
): StatusPresentation {
  const normalized = status.trim().toLowerCase();
  return Object.hasOwn(statusMap, normalized)
    ? statusMap[normalized as DataSourceStatusFilter]
    : { label: status || "Ngắt kết nối", tone: "neutral" };
}
