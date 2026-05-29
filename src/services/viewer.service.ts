import { apiClient } from "@/src/lib/api";
import {
  buildQueryString,
  extractServiceErrorMessage,
} from "@/src/services/service-utils";
import type {
  GetViewerViewsParams,
  ViewerDashboardResponse,
  ViewerViewsResponse,
} from "@/src/types/viewer";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT = "latest";

export async function getViewerDashboard(): Promise<ViewerDashboardResponse> {
  try {
    const response = await apiClient.get<ViewerDashboardResponse>(
      "/viewer/dashboard",
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(
        error,
        "Không thể tải tổng quan người xem.",
      ),
    );
  }
}

export async function getViewerViews(
  params: GetViewerViewsParams = {},
): Promise<ViewerViewsResponse> {
  const queryString = buildQueryString({
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    search: params.search?.trim() || undefined,
    sort: params.sort ?? DEFAULT_SORT,
  });

  try {
    const response = await apiClient.get<ViewerViewsResponse>(
      `/viewer/views?${queryString}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(
        error,
        "Không thể tải danh sách view được chia sẻ.",
      ),
    );
  }
}
