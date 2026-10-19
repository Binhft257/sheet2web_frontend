import StatusBadge from "@/src/components/common/status-badge";
import { getDataSourceStatusPresentation } from "@/src/components/owner/data-sources/data-source-presentation";
import type { DataSourceStatus } from "@/src/types/data-source";

type StatusBadgeProps = { status: DataSourceStatus };

export default function DataSourceStatusBadge({ status }: StatusBadgeProps) {
  const presentation = getDataSourceStatusPresentation(status);
  return (
    <StatusBadge tone={presentation.tone}>{presentation.label}</StatusBadge>
  );
}
