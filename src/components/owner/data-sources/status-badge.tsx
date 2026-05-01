import type { DataSourceStatus } from "@/src/types/data-source";

type StatusBadgeProps = {
  status: DataSourceStatus;
};

type StatusPresentation = {
  label: string;
  className: string;
  dotClassName: string;
};

const statusMap: Record<string, StatusPresentation> = {
  active: {
    label: "Success",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  error: {
    label: "Error",
    className: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dotClassName: "bg-red-500",
  },
  disconnected: {
    label: "Disconnected",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dotClassName: "bg-slate-500",
  },
};

function getStatusPresentation(status: DataSourceStatus): StatusPresentation {
  const normalized = status.trim().toLowerCase();

  return (
    statusMap[normalized] ?? {
      label: status || "Disconnected",
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      dotClassName: "bg-slate-500",
    }
  );
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const presentation = getStatusPresentation(status);

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-semibold ${presentation.className}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${presentation.dotClassName}`} />
      {presentation.label}
    </span>
  );
}
