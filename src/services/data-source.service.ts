import { apiClient } from "@/src/lib/api";
import {
  buildQueryString,
  extractServiceErrorMessage,
} from "@/src/services/service-utils";
import type {
  CreateDataSourceBody,
  DeleteDataSourceResponse,
  DataSource,
  DataSourceListResponse,
  DataSourcePreview,
  DataSourceSheet,
  DataSourceSheetsResponse,
  GetDataSourcesParams,
  PreviewDataSourceBody,
  UpdateDataSourceBody,
  UpdateDataSourceResponse,
} from "@/src/types/data-source";

type DataSourceSheetsPayload =
  | DataSourceSheet[]
  | { items: DataSourceSheet[] }
  | DataSourceSheetsResponse;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function getDataSources(
  params: GetDataSourcesParams = {},
): Promise<DataSourceListResponse> {
  const queryString = buildQueryString({
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    search: params.search?.trim() || undefined,
    status: params.status,
  });

  try {
    const response = await apiClient.get<DataSourceListResponse>(
      `/data-sources?${queryString}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể tải danh sách nguồn dữ liệu."),
    );
  }
}

export async function createDataSource(
  body: CreateDataSourceBody,
): Promise<DataSource> {
  try {
    const response = await apiClient.post<DataSource>("/data-sources", body);
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể thêm nguồn dữ liệu."),
    );
  }
}

export async function getDataSourceSheets(
  id: string,
): Promise<DataSourceSheet[]> {
  try {
    const response = await apiClient.get<DataSourceSheetsPayload>(
      `/data-sources/${id}/sheets`,
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if ("sheets" in response.data) {
      return Array.isArray(response.data.sheets) ? response.data.sheets : [];
    }

    return Array.isArray(response.data.items) ? response.data.items : [];
  } catch (error) {
    throw new Error(extractServiceErrorMessage(error, "Không thể tải danh sách sheet."));
  }
}

export async function previewDataSource(
  id: string,
  body: PreviewDataSourceBody,
): Promise<DataSourcePreview> {
  try {
    const response = await apiClient.post<DataSourcePreview>(
      `/data-sources/${id}/preview`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(extractServiceErrorMessage(error, "Không thể xem trước dữ liệu."));
  }
}

export async function updateDataSource(
  id: string,
  body: UpdateDataSourceBody,
): Promise<UpdateDataSourceResponse> {
  try {
    const response = await apiClient.patch<UpdateDataSourceResponse>(
      `/data-sources/${id}`,
      body,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      extractServiceErrorMessage(error, "Không thể cập nhật nguồn dữ liệu."),
    );
  }
}

export async function deleteDataSource(
  id: string,
): Promise<DeleteDataSourceResponse> {
  try {
    const response = await apiClient.delete<DeleteDataSourceResponse>(
      `/data-sources/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(extractServiceErrorMessage(error, "Không thể xóa nguồn dữ liệu."));
  }
}
