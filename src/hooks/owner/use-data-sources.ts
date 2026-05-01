"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createDataSource,
  getDataSourceSheets,
  getDataSources,
  previewDataSource,
} from "@/src/services/data-source.service";
import type {
  CreateDataSourceBody,
  GetDataSourcesParams,
  PreviewDataSourceBody,
} from "@/src/types/data-source";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export function useDataSources(params: GetDataSourcesParams = {}) {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const search = params.search?.trim() || undefined;
  const status = params.status;

  return useQuery({
    queryKey: ["data-sources", page, limit, search, status],
    queryFn: () =>
      getDataSources({
        page,
        limit,
        search,
        status,
      }),
    staleTime: 30_000,
  });
}

export function useCreateDataSource() {
  return useMutation({
    mutationFn: (body: CreateDataSourceBody) => createDataSource(body),
  });
}

export function useDataSourceSheets(id: string | null) {
  return useQuery({
    queryKey: ["data-source-sheets", id],
    queryFn: () => getDataSourceSheets(id ?? ""),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function usePreviewDataSource(id: string | null) {
  return useMutation({
    mutationFn: (body: PreviewDataSourceBody) =>
      previewDataSource(id ?? "", body),
  });
}
