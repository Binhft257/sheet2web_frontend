"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getViewerDashboard,
  getViewerViews,
} from "@/src/services/viewer.service";
import type { GetViewerViewsParams } from "@/src/types/viewer";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT = "latest";

export function useViewerDashboard() {
  return useQuery({
    queryKey: ["viewer", "dashboard"],
    queryFn: getViewerDashboard,
    staleTime: 30_000,
  });
}

export function useViewerViews(params: GetViewerViewsParams = {}) {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const search = params.search?.trim() || undefined;
  const sort = params.sort ?? DEFAULT_SORT;

  return useQuery({
    queryKey: ["viewer", "views", page, limit, search, sort],
    queryFn: () =>
      getViewerViews({
        page,
        limit,
        search,
        sort,
      }),
    staleTime: 30_000,
  });
}
