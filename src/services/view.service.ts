import { apiClient } from "@/src/lib/api";
import {
  buildQueryString,
  extractServiceErrorMessage,
} from "@/src/services/service-utils";
import type {
  CreateShareTokenBody,
  CreateViewBody,
  DeleteViewResponse,
  GetViewsParams,
  OwnerViewDetail,
  OwnerViewListResponse,
  PublishedView,
  PublishViewResponse,
  UpdateViewBody,
  ViewPermission,
  ViewShareToken,
} from "@/src/types/view";
import axios from "axios";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function extractItems<T>(payload: T[] | { items?: T[] }): T[] {
  return Array.isArray(payload) ? payload : payload.items ?? [];
}

export class ViewBySlugError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ViewBySlugError";
    this.status = status;
  }
}

export async function getViews(
  params: GetViewsParams = {},
): Promise<OwnerViewListResponse> {
  const queryString = buildQueryString({
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    search: params.search?.trim() || undefined,
    status: params.status,
    accessMode: params.accessMode,
  });

  try {
    const response = await apiClient.get<OwnerViewListResponse>(
      `/views/my?${queryString}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải danh sách view."),
    );
  }
}

export const getMyViews = getViews;

export async function createView(body: CreateViewBody): Promise<OwnerViewDetail> {
  try {
    const response = await apiClient.post<OwnerViewDetail>("/views", body);
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tạo bản nháp view."),
    );
  }
}

export async function getView(id: string): Promise<OwnerViewDetail> {
  try {
    const response = await apiClient.get<OwnerViewDetail>(`/views/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải chi tiết view."),
    );
  }
}

export async function getViewById(
  id: string,
  shareToken?: string,
): Promise<OwnerViewDetail> {
  const queryString = buildQueryString({ shareToken });

  try {
    const response = await apiClient.get<OwnerViewDetail>(
      `/views/${id}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải cấu hình refresh của view."),
    );
  }
}

export async function updateView(
  id: string,
  body: UpdateViewBody,
): Promise<OwnerViewDetail> {
  try {
    const response = await apiClient.patch<OwnerViewDetail>(`/views/${id}`, body);
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể lưu cấu hình view."),
    );
  }
}

export async function updatePublishedView(
  id: string,
  body: UpdateViewBody,
): Promise<OwnerViewDetail> {
  try {
    const response = await apiClient.patch<OwnerViewDetail>(
      `/views/${id}/published`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(
        error,
        "Không thể lưu cấu hình view đã xuất bản.",
      ),
    );
  }
}

export async function publishView(id: string): Promise<PublishViewResponse> {
  try {
    const response = await apiClient.post<PublishViewResponse>(
      `/views/${id}/publish`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể xuất bản view."),
    );
  }
}

export async function deleteView(id: string): Promise<DeleteViewResponse> {
  try {
    const response = await apiClient.delete<DeleteViewResponse>(`/views/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể xóa view."),
    );
  }
}

export async function getPublishedViewBySlug(
  slug: string,
  shareToken?: string,
): Promise<PublishedView> {
  const queryString = buildQueryString({ shareToken });

  try {
    const response = await apiClient.get<PublishedView>(
      `/v/${slug}${queryString ? `?${queryString}` : ""}`,
    );
    return response.data;
  } catch (error) {
    throw new ViewBySlugError(
      extractServiceErrorMessage(error, "Không thể tải view đã xuất bản."),
      axios.isAxiosError(error) ? error.response?.status : undefined,
    );
  }
}

export const getViewBySlug = getPublishedViewBySlug;

export async function getViewPermissions(
  viewId: string,
): Promise<ViewPermission[]> {
  try {
    const response = await apiClient.get<
      ViewPermission[] | { items?: ViewPermission[] }
    >(
      `/views/${viewId}/permissions`,
    );
    return extractItems(response.data);
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải danh sách phân quyền."),
    );
  }
}

export async function addViewPermissionByEmail(
  viewId: string,
  email: string,
): Promise<ViewPermission> {
  try {
    const response = await apiClient.post<ViewPermission>(
      `/views/${viewId}/permissions`,
      { email },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể cấp quyền xem view."),
    );
  }
}

export async function removeViewPermission(
  viewId: string,
  permissionId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/views/${viewId}/permissions/${permissionId}`);
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể gỡ quyền xem view."),
    );
  }
}

export async function createShareToken(
  viewId: string,
  body: CreateShareTokenBody,
): Promise<ViewShareToken> {
  try {
    const response = await apiClient.post<ViewShareToken>(
      `/views/${viewId}/share-tokens`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tạo link chia sẻ."),
    );
  }
}

export async function getShareTokens(viewId: string): Promise<ViewShareToken[]> {
  try {
    const response = await apiClient.get<
      ViewShareToken[] | { items?: ViewShareToken[] }
    >(
      `/views/${viewId}/share-tokens`,
    );
    return extractItems(response.data);
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải link chia sẻ."),
    );
  }
}

export async function revokeShareToken(
  viewId: string,
  tokenId: string,
): Promise<ViewShareToken> {
  try {
    const response = await apiClient.patch<ViewShareToken>(
      `/views/${viewId}/share-tokens/${tokenId}/revoke`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể thu hồi link chia sẻ."),
    );
  }
}
