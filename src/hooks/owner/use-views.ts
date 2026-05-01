"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createView,
  getView,
  getViews,
  publishView,
  updatePublishedView,
  updateView,
} from "@/src/services/view.service";
import type {
  CreateViewBody,
  GetViewsParams,
  UpdateViewBody,
} from "@/src/types/view";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export function useViews(params: GetViewsParams = {}) {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const search = params.search?.trim() || undefined;
  const status = params.status;
  const accessMode = params.accessMode;

  return useQuery({
    queryKey: ["views", "my", page, limit, search, status, accessMode],
    queryFn: () =>
      getViews({
        page,
        limit,
        search,
        status,
        accessMode,
      }),
    staleTime: 30_000,
  });
}

export function useView(id: string | null) {
  return useQuery({
    queryKey: ["views", "detail", id],
    queryFn: () => getView(id ?? ""),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateView() {
  return useMutation({
    mutationFn: (body: CreateViewBody) => createView(body),
  });
}

export function useUpdateView() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateViewBody }) =>
      updateView(id, body),
  });
}

export function useUpdatePublishedView() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateViewBody }) =>
      updatePublishedView(id, body),
  });
}

export function usePublishView() {
  return useMutation({
    mutationFn: (id: string) => publishView(id),
  });
}
