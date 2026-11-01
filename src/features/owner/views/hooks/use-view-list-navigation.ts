"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appPath, pushAppPath } from "@/src/lib/app-path";
import {
  readViewListLocation,
  viewListPath,
} from "@/src/features/owner/views/view-navigation";

const SCROLL_KEY = "sheet2web:owner-views:scroll:";

function rememberScroll(path: string) {
  try {
    window.sessionStorage.setItem(
      `${SCROLL_KEY}${path}`,
      String(window.scrollY),
    );
  } catch {
    // URL-based navigation still works when browser storage is unavailable.
  }
}

export default function useViewListNavigation() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.toString();
  const location = readViewListLocation(params);

  function update(
    changes: Record<string, string | null>,
    push = false,
    keepScroll = false,
  ) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const path = viewListPath(next);
    if (keepScroll) rememberScroll(path);
    if (push) window.history.pushState(null, "", appPath(path));
    else window.history.replaceState(null, "", appPath(path));
  }

  function openEditor(id: string) {
    const next = new URLSearchParams(window.location.search);
    next.set("detail", id);
    const returnTo = viewListPath(next);
    rememberScroll(returnTo);
    window.history.replaceState(null, "", appPath(returnTo));
    const editorParams = new URLSearchParams({
      viewId: id,
      step: "2",
      returnTo,
    });
    pushAppPath(router, `/owner/views/new?${editorParams.toString()}`);
  }

  const restoreScroll = useCallback(() => {
    let top: number;
    try {
      const saved = window.sessionStorage.getItem(
        `${SCROLL_KEY}${viewListPath(new URLSearchParams(query))}`,
      );
      if (saved === null) return;
      top = Number(saved);
      if (!Number.isFinite(top) || top < 0) return;
    } catch {
      return;
    }
    const frame = window.requestAnimationFrame(() =>
      window.scrollTo({ top, behavior: "instant" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [query]);

  return {
    ...location,
    changeSearch: (search: string) => update({ search, page: null }),
    changeStatus: (status: string) => update({ status, page: null }),
    changeAccess: (accessMode: string) => update({ accessMode, page: null }),
    changePage: (page: number) =>
      update({ page: page > 1 ? String(page) : null }),
    showDetail: (id: string) => update({ detail: id }, true, true),
    closeDetail: () => update({ detail: null }, false, true),
    clearFilters: () =>
      update({ search: null, status: null, accessMode: null, page: null }),
    openEditor,
    restoreScroll,
  };
}
