"use client";

import { useQuery } from "@tanstack/react-query";
import { getViewBySlug } from "@/src/services/view.service";

export function usePublishedView(slug: string, shareToken?: string) {
  return useQuery({
    queryKey: ["published-view", slug, shareToken ?? ""],
    queryFn: () => getViewBySlug(slug, shareToken),
    enabled: Boolean(slug),
    retry: false,
    staleTime: 30_000,
  });
}
