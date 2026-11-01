import { internalPath } from "@/src/lib/app-path";
import type { ViewAccessModeFilter, ViewStatusFilter } from "@/src/types/view";

export const VIEWS_PATH = "/owner/views";

type ViewListLocation = {
  page: number;
  search: string;
  statusFilter: ViewStatusFilter | "";
  accessModeFilter: ViewAccessModeFilter | "";
  detailViewId: string | null;
};

export function readViewListLocation(
  params: Pick<URLSearchParams, "get">,
): ViewListLocation {
  const page = Number(params.get("page") ?? 1);
  const status = params.get("status");
  const access = params.get("accessMode");
  return {
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
    search: params.get("search") ?? "",
    statusFilter:
      status === "draft" || status === "published" || status === "archived"
        ? status
        : "",
    accessModeFilter: access === "public" || access === "private" ? access : "",
    detailViewId: params.get("detail") || null,
  };
}

export function viewListPath(params: URLSearchParams) {
  const query = params.toString();
  return `${VIEWS_PATH}${query ? `?${query}` : ""}`;
}

export function viewDetailPath(
  viewId: string,
  returnTo?: string | null,
  published = false,
) {
  const target = new URL(
    getViewReturnPath(returnTo) ?? VIEWS_PATH,
    "https://sheet2web.invalid",
  );
  target.searchParams.set("detail", viewId);
  if (published) target.searchParams.set("notice", "published");
  else target.searchParams.delete("notice");
  return viewListPath(target.searchParams);
}

/** Only return to the view list; never navigate to a URL supplied by another origin. */
export function getViewReturnPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return null;
  try {
    const url = new URL(value, "https://sheet2web.invalid");
    if (
      url.origin !== "https://sheet2web.invalid" ||
      internalPath(url.pathname) !== VIEWS_PATH
    )
      return null;
    return `${VIEWS_PATH}${url.search}`;
  } catch {
    return null;
  }
}
