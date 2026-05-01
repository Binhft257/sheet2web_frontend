"use client";

import { usePublishView, useView, useViews } from "@/src/hooks/owner/use-views";
import {
  addViewPermissionByEmail,
  createShareToken,
  getShareTokens,
  getViewPermissions,
  publishView,
  removeViewPermission,
  revokeShareToken,
} from "@/src/services/view.service";
import type { PaginationMeta } from "@/src/types/pagination";
import type {
  OwnerView,
  ThemePreset,
  ViewAccessMode,
  ViewAccessModeFilter,
  ViewJsonObject,
  ViewPermission,
  ViewSelectionType,
  ViewShareToken,
  ViewStatus,
  ViewStatusFilter,
} from "@/src/types/view";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, SVGProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const VIEWS_LIMIT = 10;
const AUTO_PUBLISH_CHECK_INTERVAL_MS = 1_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ToastMessage = {
  type: "success" | "error";
  message: string;
};

function PlusIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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

function CloseIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
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

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
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

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function formatDateTime(dateTime: string | null | undefined) {
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

function isPublishedView(view: OwnerView) {
  return view.status.toLowerCase() === "published";
}

function isAutoPublishEnabled(view: OwnerView) {
  return view.settingsJson?.autoPublishEnabled === true;
}

function getRefreshLabel(
  view: Pick<OwnerView, "refreshIntervalSeconds" | "settingsJson">,
) {
  return view.settingsJson?.autoPublishEnabled === true
    ? `${view.refreshIntervalSeconds} giây`
    : "Thủ công";
}

function getIntervalMs(view: OwnerView) {
  const intervalSeconds = Number(view.refreshIntervalSeconds);

  if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
    return null;
  }

  return intervalSeconds * 1_000;
}

function getLastPublishedTime(view: OwnerView) {
  const publishedAt = view.lastPublishedAt ?? view.currentSnapshot?.fetchedAt;
  if (!publishedAt) {
    return 0;
  }

  const timestamp = new Date(publishedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "modern" || value === "classic" || value === "minimal";
}

function getThemePreset(themeOverrideJson: ViewJsonObject | null | undefined) {
  const preset = themeOverrideJson?.preset;
  return isThemePreset(preset) ? preset : "modern";
}

function getSelectionLabel(
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

function getPublishedUrl(view: OwnerView) {
  if (view.status !== "published") {
    return null;
  }

  return view.publicUrl || `/v/${view.slug}`;
}

function getAbsoluteUrl(url: string) {
  if (typeof window === "undefined") {
    return url;
  }

  return new URL(url, window.location.origin).toString();
}

function getPermissionUserName(permission: ViewPermission) {
  return (
    permission.user?.name || permission.user?.email || permission.email || "--"
  );
}

function getPermissionUserEmail(permission: ViewPermission) {
  return permission.user?.email || permission.email || "--";
}

function isShareTokenRevoked(token: ViewShareToken) {
  return token.isRevoked === true || Boolean(token.revokedAt);
}

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: "blue" | "green" | "slate" | "amber" | "red";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-800 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ring-1 ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: ViewStatus }) {
  const normalized = status.toLowerCase();

  if (normalized === "published") {
    return <Badge tone="green">Published</Badge>;
  }

  if (normalized === "draft") {
    return <Badge tone="amber">Draft</Badge>;
  }

  if (normalized === "archived") {
    return <Badge tone="slate">Archived</Badge>;
  }

  return <Badge tone="slate">{status || "Draft"}</Badge>;
}

function AccessBadge({ accessMode }: { accessMode: ViewAccessMode }) {
  return accessMode === "private" ? (
    <Badge tone="slate">Private</Badge>
  ) : (
    <Badge tone="blue">Public</Badge>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr className="border-b border-slate-100" key={`view-loading-${index}`}>
          {Array.from({ length: 10 }).map((__, cellIndex) => (
            <td
              className="px-5 py-5"
              key={`view-loading-${index}-${cellIndex}`}
            >
              <div className="h-5 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => startPage + index);
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(meta.totalPages, 1);
  const currentPage = Math.min(Math.max(meta.page, 1), totalPages);
  const startItem = meta.total === 0 ? 0 : (currentPage - 1) * meta.limit + 1;
  const endItem = Math.min(currentPage * meta.limit, meta.total);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm font-medium text-slate-500">
        Hiển thị <span className="font-bold text-slate-900">{startItem}</span>
        {"-"}
        <span className="font-bold text-slate-900">{endItem}</span> trong tổng
        số <span className="font-bold text-slate-900">{meta.total}</span> view
      </p>

      <div className="flex items-center gap-1.5">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {visiblePages.map((page) => {
          const active = page === currentPage;
          return (
            <button
              className={`inline-flex h-11 w-11 items-center justify-center rounded-md text-sm font-bold transition-colors ${
                active
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          );
        })}

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function DetailModal({
  viewId,
  onClose,
}: {
  viewId: string | null;
  onClose: () => void;
}) {
  const viewQuery = useView(viewId);

  if (!viewId) {
    return null;
  }

  const view = viewQuery.data;
  const detailItems = view
    ? [
        ["Tên view", view.name],
        ["Slug", view.slug],
        ["Trạng thái", view.status],
        ["Quyền truy cập", view.accessMode],
        [
          "Selection",
          getSelectionLabel(view.selectionType, view.rangeA1Notation),
        ],
        ["Nguồn dữ liệu", view.dataSource?.title ?? "—"],
        ["Sheet", view.sourceSheet?.sheetName ?? "—"],
        ["Dòng đầu làm header", view.useFirstRowAsHeader ? "Có" : "Không"],
        ["Refresh", getRefreshLabel(view)],
        ["Cho đổi theme", view.allowThemeSwitch ? "Có" : "Không"],
        ["Theme preset", getThemePreset(view.themeOverrideJson)],
        [
          "Snapshot",
          view.currentSnapshot
            ? `${view.currentSnapshot.rowCount} dòng · ${formatDateTime(
                view.currentSnapshot.fetchedAt,
              )}`
            : "—",
        ],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <button
        aria-label="Đóng modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết view</h2>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {viewQuery.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="h-12 animate-pulse rounded-md bg-slate-100"
                  key={`detail-loading-${index}`}
                />
              ))}
            </div>
          ) : viewQuery.isError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-sm font-bold text-red-700">
                {getErrorMessage(
                  viewQuery.error,
                  "Không thể tải chi tiết view.",
                )}
              </p>
              <button
                className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                onClick={() => viewQuery.refetch()}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              {detailItems.map(([label, value]) => (
                <div
                  className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
                  key={label}
                >
                  <dt className="text-sm font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}

function SharingModal({
  view,
  onClose,
  onToast,
}: {
  view: OwnerView | null;
  onClose: () => void;
  onToast: (toast: ToastMessage) => void;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [createdTokenUrl, setCreatedTokenUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"permissions" | "tokens">(
    "permissions",
  );

  const enabled = Boolean(view);
  const isPublished = view ? isPublishedView(view) : false;
  const isPrivate = view?.accessMode === "private";
  const permissionsQuery = useQuery({
    queryKey: ["views", "permissions", view?.id],
    queryFn: () => getViewPermissions(view?.id ?? ""),
    enabled: enabled && isPublished && isPrivate,
  });
  const shareTokensQuery = useQuery({
    queryKey: ["views", "share-tokens", view?.id],
    queryFn: () => getShareTokens(view?.id ?? ""),
    enabled: enabled && isPublished && isPrivate,
  });
  const addPermissionMutation = useMutation({
    mutationFn: (nextEmail: string) =>
      addViewPermissionByEmail(view?.id ?? "", nextEmail),
    onSuccess: async () => {
      setEmail("");
      onToast({ type: "success", message: "Đã cấp quyền xem view." });
      await queryClient.invalidateQueries({
        queryKey: ["views", "permissions", view?.id],
      });
    },
    onError: (error) =>
      onToast({
        type: "error",
        message: getErrorMessage(error, "Không thể cấp quyền xem view."),
      }),
  });
  const removePermissionMutation = useMutation({
    mutationFn: (permissionId: string) =>
      removeViewPermission(view?.id ?? "", permissionId),
    onSuccess: async () => {
      onToast({ type: "success", message: "Đã gỡ quyền xem view." });
      await queryClient.invalidateQueries({
        queryKey: ["views", "permissions", view?.id],
      });
    },
    onError: (error) =>
      onToast({
        type: "error",
        message: getErrorMessage(error, "Không thể gỡ quyền xem view."),
      }),
  });
  const createTokenMutation = useMutation({
    mutationFn: () =>
      createShareToken(view?.id ?? "", {
        name: tokenName.trim() || undefined,
        expiresAt: null,
      }),
    onSuccess: async (token) => {
      setTokenName("");
      setCreatedTokenUrl(getShareTokenUrl(token));
      onToast({ type: "success", message: "Đã tạo link chia sẻ." });
      await queryClient.invalidateQueries({
        queryKey: ["views", "share-tokens", view?.id],
      });
    },
    onError: (error) =>
      onToast({
        type: "error",
        message: getErrorMessage(error, "Không thể tạo link chia sẻ."),
      }),
  });
  const revokeTokenMutation = useMutation({
    mutationFn: (tokenId: string) => revokeShareToken(view?.id ?? "", tokenId),
    onSuccess: async () => {
      onToast({ type: "success", message: "Đã thu hồi link chia sẻ." });
      await queryClient.invalidateQueries({
        queryKey: ["views", "share-tokens", view?.id],
      });
    },
    onError: (error) =>
      onToast({
        type: "error",
        message: getErrorMessage(error, "Không thể thu hồi link chia sẻ."),
      }),
  });

  if (!view) {
    return null;
  }
  const activeView = view;

  async function handleAddPermission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      onToast({ type: "error", message: "Vui lòng nhập email." });
      return;
    }

    if (!EMAIL_PATTERN.test(nextEmail)) {
      onToast({ type: "error", message: "Email không hợp lệ." });
      return;
    }

    await addPermissionMutation.mutateAsync(nextEmail);
  }

  function getShareTokenUrl(token: ViewShareToken) {
    if (token.url || token.shareUrl) {
      return token.url ?? token.shareUrl ?? "";
    }

    if (token.token) {
      return `/v/${activeView.slug}?shareToken=${encodeURIComponent(token.token)}`;
    }

    return "";
  }

  async function handleCopyModalLink(url: string) {
    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(getAbsoluteUrl(url));
      onToast({ type: "success", message: "Đã copy link." });
    } catch {
      onToast({ type: "error", message: "Không thể copy link." });
    }
  }

  function handleRemovePermission(permissionId: string) {
    if (!window.confirm("Gỡ quyền xem của user này?")) {
      return;
    }

    removePermissionMutation.mutate(permissionId);
  }

  function handleRevokeToken(tokenId: string) {
    if (!window.confirm("Thu hồi link chia sẻ này?")) {
      return;
    }

    revokeTokenMutation.mutate(tokenId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <button
        aria-label="Đóng modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Phân quyền View
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {activeView.name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={activeView.status} />
              <AccessBadge accessMode={activeView.accessMode} />
            </div>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {isPublished && isPrivate ? (
          <div className="border-b border-slate-100 px-6 pt-4">
            <div className="flex gap-2">
              {[
                { value: "permissions", label: "Cấp quyền" },
                { value: "tokens", label: "Link chia sẻ" },
              ].map((tab) => (
                <button
                  className={`rounded-t-md px-4 py-2 text-sm font-bold ${
                    activeTab === tab.value
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  key={tab.value}
                  onClick={() =>
                    setActiveTab(tab.value as "permissions" | "tokens")
                  }
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="max-h-[62vh] overflow-y-auto px-6 py-6">
          {!isPublished ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold text-amber-800">
              View cần được xuất bản trước khi chia sẻ.
            </div>
          ) : !isPrivate ? (
            <div className="space-y-4">
              <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-4 text-sm font-semibold text-blue-900">
                View đang public, ai có link đều có thể xem.
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-bold uppercase text-slate-400">
                  Link public
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {getPublishedUrl(activeView)}
                </p>
                <button
                  className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                  onClick={() =>
                    handleCopyModalLink(getPublishedUrl(activeView) ?? "")
                  }
                  type="button"
                >
                  Copy link public
                </button>
              </div>
            </div>
          ) : activeTab === "permissions" ? (
            <div className="space-y-5">
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={handleAddPermission}
              >
                <input
                  className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@example.com"
                  type="email"
                  value={email}
                />
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={addPermissionMutation.isPending}
                  type="submit"
                >
                  Cấp quyền
                </button>
              </form>

              {permissionsQuery.isPending ? (
                <div className="h-24 animate-pulse rounded-md bg-slate-100" />
              ) : permissionsQuery.isError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-bold text-red-700">
                    {getErrorMessage(
                      permissionsQuery.error,
                      "Không thể tải danh sách phân quyền.",
                    )}
                  </p>
                  <button
                    className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                    onClick={() => permissionsQuery.refetch()}
                    type="button"
                  >
                    Thử lại
                  </button>
                </div>
              ) : permissionsQuery.data?.length ? (
                <ul className="space-y-2">
                  {permissionsQuery.data.map((permission: ViewPermission) => (
                    <li
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3"
                      key={permission.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {getPermissionUserName(permission)}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-500">
                          {getPermissionUserEmail(permission)}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase text-slate-400">
                          {permission.role ?? "viewer"} ·{" "}
                          {formatDateTime(permission.createdAt)}
                        </p>
                      </div>
                      <button
                        className="text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                        disabled={removePermissionMutation.isPending}
                        onClick={() => handleRemovePermission(permission.id)}
                        type="button"
                      >
                        Gỡ quyền
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
                  Chưa có user nào được cấp quyền.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="h-11 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) => setTokenName(event.target.value)}
                  placeholder="Tên link chia sẻ"
                  type="text"
                  value={tokenName}
                />
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createTokenMutation.isPending}
                  onClick={() => createTokenMutation.mutate()}
                  type="button"
                >
                  Tạo link
                </button>
              </div>

              {createdTokenUrl ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-sm font-bold uppercase text-emerald-700">
                    Link vừa tạo
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-emerald-950">
                    {createdTokenUrl}
                  </p>
                  <button
                    className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-emerald-700 bg-emerald-700 px-4 text-sm font-bold text-white transition-colors hover:border-emerald-800 hover:bg-emerald-800"
                    onClick={() => handleCopyModalLink(createdTokenUrl)}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
              ) : null}

              {shareTokensQuery.isPending ? (
                <div className="h-24 animate-pulse rounded-md bg-slate-100" />
              ) : shareTokensQuery.isError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-bold text-red-700">
                    {getErrorMessage(
                      shareTokensQuery.error,
                      "Không thể tải link chia sẻ.",
                    )}
                  </p>
                  <button
                    className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
                    onClick={() => shareTokensQuery.refetch()}
                    type="button"
                  >
                    Thử lại
                  </button>
                </div>
              ) : shareTokensQuery.data?.length ? (
                <ul className="space-y-2">
                  {shareTokensQuery.data.map((token) => {
                    const shareUrl = getShareTokenUrl(token);
                    const revoked = isShareTokenRevoked(token);
                    return (
                      <li
                        className="rounded-md border border-slate-200 px-4 py-3"
                        key={token.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {token.name || "Link chia sẻ"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {revoked ? (
                                <Badge tone="red">Đã thu hồi</Badge>
                              ) : (
                                <Badge tone="green">Đang hoạt động</Badge>
                              )}
                              {token.createdAt ? (
                                <span className="text-xs font-bold uppercase text-slate-400">
                                  Tạo {formatDateTime(token.createdAt)}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 break-all text-sm font-medium text-slate-500">
                              {shareUrl || "Không có URL trả về"}
                            </p>
                            {token.expiresAt ? (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Hết hạn {formatDateTime(token.expiresAt)}
                              </p>
                            ) : null}
                            {token.revokedAt ? (
                              <p className="mt-1 text-xs font-semibold text-red-600">
                                Thu hồi {formatDateTime(token.revokedAt)}
                              </p>
                            ) : null}
                            {token.lastUsedAt ? (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Dùng lần cuối {formatDateTime(token.lastUsedAt)}
                              </p>
                            ) : null}
                          </div>
                          <button
                            className="text-sm font-bold text-blue-700 hover:text-blue-800 disabled:opacity-50"
                            disabled={!shareUrl || revoked}
                            onClick={() => handleCopyModalLink(shareUrl)}
                            type="button"
                          >
                            Copy
                          </button>
                          <button
                            className="text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-50"
                            disabled={revoked || revokeTokenMutation.isPending}
                            onClick={() => handleRevokeToken(token.id)}
                            type="button"
                          >
                            {revoked ? "Đã thu hồi" : "Thu hồi"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-500">
                  Chưa có link chia sẻ nào.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ViewList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ViewStatusFilter | "">("");
  const [accessModeFilter, setAccessModeFilter] = useState<
    ViewAccessModeFilter | ""
  >("");
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [detailViewId, setDetailViewId] = useState<string | null>(null);
  const [sharingView, setSharingView] = useState<OwnerView | null>(null);
  const autoPublishInFlightRef = useRef<Set<string>>(new Set());
  const lastAutoPublishAttemptRef = useRef<Map<string, number>>(new Map());

  const viewsQuery = useViews({
    page,
    limit: VIEWS_LIMIT,
    search,
    status: statusFilter || undefined,
    accessMode: accessModeFilter || undefined,
  });
  const publishViewMutation = usePublishView();

  const views = useMemo(() => viewsQuery.data?.items ?? [], [viewsQuery.data]);
  const paginationMeta = viewsQuery.data?.meta ?? {
    page,
    limit: VIEWS_LIMIT,
    total: 0,
    totalPages: 1,
  };
  const tableErrorMessage = viewsQuery.isError
    ? getErrorMessage(viewsQuery.error, "Không thể tải danh sách view.")
    : null;

  const hasFilters = useMemo(
    () => Boolean(search.trim() || statusFilter || accessModeFilter),
    [accessModeFilter, search, statusFilter],
  );

  useEffect(() => {
    if (!viewsQuery.isSuccess || views.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      for (const view of views) {
        if (!isPublishedView(view) || !isAutoPublishEnabled(view)) {
          continue;
        }

        const intervalMs = getIntervalMs(view);
        if (!intervalMs || autoPublishInFlightRef.current.has(view.id)) {
          continue;
        }

        const lastPublishedTime = getLastPublishedTime(view);
        const lastAttemptTime =
          lastAutoPublishAttemptRef.current.get(view.id) ?? 0;
        const nextPublishFrom = Math.max(lastPublishedTime, lastAttemptTime);

        if (now - nextPublishFrom < intervalMs) {
          continue;
        }

        autoPublishInFlightRef.current.add(view.id);
        lastAutoPublishAttemptRef.current.set(view.id, now);

        publishView(view.id)
          .then(() =>
            queryClient.invalidateQueries({ queryKey: ["views", "my"] }),
          )
          .catch(() => {
            // A failed auto refresh should not block the owner from using the page.
          })
          .finally(() => {
            autoPublishInFlightRef.current.delete(view.id);
          });
      }
    }, AUTO_PUBLISH_CHECK_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [queryClient, views, viewsQuery.isSuccess]);

  function showToast(toast: ToastMessage) {
    setToastMessage(toast);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value as ViewStatusFilter | "");
    setPage(1);
  }

  function handleAccessModeChange(event: ChangeEvent<HTMLSelectElement>) {
    setAccessModeFilter(event.target.value as ViewAccessModeFilter | "");
    setPage(1);
  }

  async function handlePublish(view: OwnerView) {
    try {
      const isRefresh = isPublishedView(view);
      const result = await publishViewMutation.mutateAsync(view.id);
      showToast({
        type: "success",
        message: isRefresh
          ? `Cập nhật thành công: ${result.url}`
          : `Xuất bản thành công: ${result.url}`,
      });
      await queryClient.invalidateQueries({ queryKey: ["views", "my"] });
    } catch (error) {
      showToast({
        type: "error",
        message: getErrorMessage(error, "Không thể xuất bản view."),
      });
    }
  }

  async function handleCopyLink(view: OwnerView) {
    const url = getPublishedUrl(view);
    if (!url) {
      return;
    }

    const absoluteUrl =
      typeof window === "undefined"
        ? url
        : new URL(url, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      showToast({ type: "success", message: "Đã copy link." });
    } catch {
      showToast({ type: "error", message: "Không thể copy link." });
    }
  }

  function handleOpenView(view: OwnerView) {
    const url = getPublishedUrl(view);
    if (!url || typeof window === "undefined") {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      {toastMessage ? (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-3 rounded-lg border px-5 py-4 text-sm font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.12)] ${
            toastMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{toastMessage.message}</span>
          <button
            className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/60"
            onClick={() => setToastMessage(null)}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý View</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý các trang dữ liệu đã tạo từ Google Sheet
          </p>
        </div>

        <Link
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)] transition-colors hover:border-blue-800 hover:bg-blue-800"
          href="/owner/views/new"
        >
          <PlusIcon className="h-5 w-5" />
          Tạo View mới
        </Link>
      </header>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] lg:grid-cols-[minmax(260px,1fr)_200px_200px]">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            onChange={handleSearchChange}
            placeholder="Tìm tên view..."
            type="search"
            value={search}
          />
        </div>

        <select
          className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          onChange={handleStatusChange}
          value={statusFilter}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          onChange={handleAccessModeChange}
          value={accessModeFilter}
        >
          <option value="">Tất cả quyền truy cập</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="bg-[#f5f5fa]">
              <tr className="border-b border-slate-100">
                {[
                  "Tên view",
                  "Nguồn dữ liệu",
                  "Sheet",
                  "Selection",
                  "Quyền",
                  "Trạng thái",
                  "Số dòng",
                  "Lần publish/cập nhật",
                  "Link",
                  "Hành động",
                ].map((heading) => (
                  <th
                    className="px-5 py-4 text-sm font-bold text-slate-500"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {viewsQuery.isPending ? (
                <LoadingRows />
              ) : tableErrorMessage ? (
                <tr>
                  <td className="px-6 py-14 text-center" colSpan={10}>
                    <div className="mx-auto max-w-md">
                      <p className="text-base font-bold text-slate-900">
                        Không thể tải danh sách view
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {tableErrorMessage}
                      </p>
                      <button
                        className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                        onClick={() => viewsQuery.refetch()}
                        type="button"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : views.length === 0 ? (
                <tr>
                  <td className="px-6 py-16 text-center" colSpan={10}>
                    <div className="mx-auto max-w-md">
                      <p className="text-base font-bold text-slate-900">
                        {hasFilters
                          ? "Không tìm thấy view phù hợp"
                          : "Chưa có view nào"}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Tạo View mới để chia sẻ dữ liệu từ Google Sheet
                      </p>
                      <button
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                        onClick={() => router.push("/owner/views/new")}
                        type="button"
                      >
                        Tạo View mới
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                views.map((view) => {
                  const publishedUrl = getPublishedUrl(view);
                  const canPublish = view.status === "draft";
                  const canEdit = canPublish || isPublishedView(view);
                  const canRefresh = isPublishedView(view);
                  const canOpen = view.status === "published";
                  const canShare = isPublishedView(view);
                  const shareLabel =
                    view.accessMode === "private" ? "Phân quyền" : "Chia sẻ";

                  return (
                    <tr
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      key={view.id}
                    >
                      <td className="max-w-[260px] px-5 py-5">
                        <p className="line-clamp-2 font-bold text-slate-900">
                          {view.name}
                        </p>
                      </td>
                      <td className="max-w-[220px] px-5 py-5 font-semibold text-slate-700">
                        <span className="line-clamp-2">
                          {view.dataSource?.title ?? "—"}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-5 py-5 font-semibold text-slate-700">
                        <span className="line-clamp-2">
                          {view.sourceSheet?.sheetName ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-700">
                        {getSelectionLabel(
                          view.selectionType,
                          view.rangeA1Notation,
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <AccessBadge accessMode={view.accessMode} />
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={view.status} />
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-700">
                        {view.currentSnapshot?.rowCount ?? "—"}
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-500">
                        {formatDateTime(view.lastPublishedAt ?? view.updatedAt)}
                      </td>
                      <td className="max-w-[220px] px-5 py-5">
                        {publishedUrl ? (
                          <span className="block truncate font-semibold text-blue-800">
                            {publishedUrl}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-400">
                            Chưa publish
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                            onClick={() => setDetailViewId(view.id)}
                            type="button"
                          >
                            Chi tiết
                          </button>
                          {canEdit ? (
                            <button
                              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                              onClick={() =>
                                router.push(
                                  `/owner/views/new?viewId=${view.id}&step=2`,
                                )
                              }
                              type="button"
                            >
                              Sửa
                            </button>
                          ) : null}
                          {canPublish ? (
                            <button
                              className="rounded-md border border-blue-700 bg-blue-700 px-3 py-2 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={publishViewMutation.isPending}
                              onClick={() => handlePublish(view)}
                              type="button"
                            >
                              Xuất bản
                            </button>
                          ) : null}
                          {canRefresh ? (
                            <button
                              className="rounded-md border border-blue-700 bg-blue-700 px-3 py-2 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={publishViewMutation.isPending}
                              onClick={() => handlePublish(view)}
                              type="button"
                            >
                              Cập nhật
                            </button>
                          ) : null}
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canOpen}
                            onClick={() => handleOpenView(view)}
                            type="button"
                          >
                            Mở view
                          </button>
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!publishedUrl}
                            onClick={() => handleCopyLink(view)}
                            type="button"
                          >
                            Copy link
                          </button>
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canShare}
                            onClick={() => setSharingView(view)}
                            title={
                              canShare
                                ? shareLabel
                                : "Cần publish view trước khi chia sẻ"
                            }
                            type="button"
                          >
                            {shareLabel}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!tableErrorMessage ? (
        <Pagination meta={paginationMeta} onPageChange={setPage} />
      ) : null}

      <DetailModal
        onClose={() => setDetailViewId(null)}
        viewId={detailViewId}
      />
      <SharingModal
        key={sharingView?.id ?? "sharing-modal"}
        onClose={() => setSharingView(null)}
        onToast={showToast}
        view={sharingView}
      />
    </section>
  );
}
