import type { ViewerSharedView } from "@/src/types/viewer";
import type { SVGProps } from "react";

export function ExternalIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

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
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${
        isPrivate
          ? "bg-slate-100 text-slate-700 ring-slate-200"
          : "bg-blue-50 text-blue-800 ring-blue-100"
      }`}
    >
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}
