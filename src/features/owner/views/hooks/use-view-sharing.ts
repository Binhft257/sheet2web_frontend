"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import {
  addViewPermissionByEmail,
  createShareToken,
  getShareTokens,
  getViewPermissions,
  removeViewPermission,
  revokeShareToken,
} from "@/src/services/view.service";
import { appPath } from "@/src/lib/app-path";
import type { OwnerView, ViewShareToken } from "@/src/types/view";
import type { ViewToast } from "@/src/features/owner/views/types";
import {
  getAbsoluteUrl,
  getErrorMessage,
  isPublishedView,
  toDateTimeLocalInputValue,
} from "@/src/features/owner/views/view-utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useViewSharing(
  view: OwnerView | null,
  onToast: (toast: ViewToast) => void,
) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState("");
  const [createdTokenUrl, setCreatedTokenUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"permissions" | "tokens">(
    "permissions",
  );
  const minTokenExpiresAt = useMemo(
    () => toDateTimeLocalInputValue(new Date()),
    [],
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
    mutationFn: (expiresAt: string | null) =>
      createShareToken(view?.id ?? "", {
        name: tokenName.trim() || undefined,
        expiresAt,
      }),
    onSuccess: async (token) => {
      setTokenName("");
      setTokenExpiresAt("");
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

    // onError provides feedback; consume the rejection from the form submission.
    await addPermissionMutation.mutateAsync(nextEmail).catch(() => undefined);
  }

  function getShareTokenUrl(token: ViewShareToken) {
    if (token.url || token.shareUrl) {
      return appPath(token.url ?? token.shareUrl ?? "");
    }

    if (token.token) {
      return appPath(
        `/v/${view?.slug ?? ""}?shareToken=${encodeURIComponent(token.token)}`,
      );
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

  async function handleCreateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expiresAtInput = tokenExpiresAt.trim();
    let expiresAt: string | null = null;

    if (expiresAtInput) {
      const parsedExpiresAt = new Date(expiresAtInput);

      if (Number.isNaN(parsedExpiresAt.getTime())) {
        onToast({
          type: "error",
          message: "Thời gian hết hạn không hợp lệ.",
        });
        return;
      }

      if (parsedExpiresAt.getTime() <= Date.now()) {
        onToast({
          type: "error",
          message: "Thời gian hết hạn phải lớn hơn hiện tại.",
        });
        return;
      }

      expiresAt = parsedExpiresAt.toISOString();
    }

    // onError provides feedback; consume the rejection from the form submission.
    await createTokenMutation.mutateAsync(expiresAt).catch(() => undefined);
  }

  function handleRevokeToken(tokenId: string) {
    if (!window.confirm("Thu hồi link chia sẻ này?")) {
      return;
    }

    revokeTokenMutation.mutate(tokenId);
  }

  return {
    email,
    setEmail,
    tokenName,
    setTokenName,
    tokenExpiresAt,
    setTokenExpiresAt,
    createdTokenUrl,
    activeTab,
    setActiveTab,
    minTokenExpiresAt,
    isPublished,
    isPrivate,
    permissionsQuery,
    shareTokensQuery,
    addPermissionPending: addPermissionMutation.isPending,
    removePermissionPending: removePermissionMutation.isPending,
    createTokenPending: createTokenMutation.isPending,
    revokeTokenPending: revokeTokenMutation.isPending,
    handleAddPermission,
    handleRemovePermission,
    handleCreateToken,
    handleRevokeToken,
    getShareTokenUrl,
    handleCopyModalLink,
  };
}
export type ViewSharingState = ReturnType<typeof useViewSharing>;
