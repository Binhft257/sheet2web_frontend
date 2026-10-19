import { appPath } from "@/src/lib/app-path";
import type {
  OwnerView,
  ThemePreset,
  ViewJsonObject,
  ViewPermission,
  ViewSelectionType,
  ViewShareToken,
} from "@/src/types/view";

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function formatDateTime(dateTime: string | null | undefined) {
  if (!dateTime) {
    return "—";
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function toDateTimeLocalInputValue(date: Date) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}

export function isPublishedView(view: OwnerView) {
  return view.status.toLowerCase() === "published";
}

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "modern" || value === "classic" || value === "minimal";
}

export function getThemePreset(
  themeOverrideJson: ViewJsonObject | null | undefined,
) {
  const preset = themeOverrideJson?.preset;
  return isThemePreset(preset) ? preset : "modern";
}

export function getSelectionLabel(
  selectionType: ViewSelectionType,
  rangeA1Notation: string | null,
) {
  if (selectionType === "full_sheet") {
    return "Toàn bộ sheet";
  }

  if (selectionType === "range") {
    return rangeA1Notation || "Range";
  }

  return selectionType || "—";
}

export function getPublishedUrl(view: OwnerView) {
  if (view.status !== "published") {
    return null;
  }

  return appPath(view.publicUrl || `/v/${view.slug}`);
}

export function getAbsoluteUrl(url: string) {
  if (typeof window === "undefined") {
    return url;
  }

  return new URL(appPath(url), window.location.origin).toString();
}

export function getPermissionUserName(permission: ViewPermission) {
  return (
    permission.user?.name || permission.user?.email || permission.email || "--"
  );
}

export function getPermissionUserEmail(permission: ViewPermission) {
  return permission.user?.email || permission.email || "--";
}

export function isShareTokenRevoked(token: ViewShareToken) {
  return token.isRevoked === true || Boolean(token.revokedAt);
}
