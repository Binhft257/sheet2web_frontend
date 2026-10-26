import StatusBadge from "@/src/components/common/status-badge";
import type { ViewerSharedView } from "@/src/types/viewer";

export {
  ExternalIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/src/components/common/icons";

export function formatDateTime(dateTime: string | null | undefined) {
  if (!dateTime) {
    return "--";
  }

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

export function getViewUrl(view: ViewerSharedView) {
  return view.url || `/v/${view.slug}`;
}

export function getUpdatedOrSharedLabel(view: ViewerSharedView) {
  return formatDateTime(view.sharedAt || view.snapshot?.fetchedAt);
}

export function AccessBadge({ accessMode }: { accessMode: string }) {
  const isPrivate = accessMode.trim().toLowerCase() === "private";

  return (
    <StatusBadge tone={isPrivate ? "neutral" : "info"} showDot={false}>
      {isPrivate ? "Private" : "Public"}
    </StatusBadge>
  );
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
