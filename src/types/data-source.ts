import type { PaginatedResponse } from "@/src/types/pagination";

export type DataSourceType = "google_sheet" | string;
export type DataSourceStatus = "active" | "error" | "disconnected" | string;
export type DataSourceStatusFilter = "active" | "error" | "disconnected";

export type DataSource = {
  id: string;
  title: string;
  sourceType: DataSourceType;
  sourceStatus: DataSourceStatus;
  spreadsheetId: string | null;
  sheetCount: number;
  lastSyncedStructureAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DataSourceListResponse = PaginatedResponse<DataSource>;

export type GetDataSourcesParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: DataSourceStatusFilter;
};

export type CreateDataSourceBody = {
  sourceUrl: string;
  title?: string;
};

export type DataSourceSheetMetadata = {
  rowCount?: number;
  columnCount?: number;
  [key: string]: unknown;
};

export type DataSourceSheet = {
  id: string;
  sheetId?: string | number;
  sheetName: string;
  title?: string;
  googleSheetId?: number;
  gid?: string;
  sortOrder?: number;
  isHidden?: boolean;
  metadata?: DataSourceSheetMetadata | null;
  metadataJson?: DataSourceSheetMetadata | null;
  rowCount?: number;
  columnCount?: number;
  [key: string]: unknown;
};

export type DataSourceSheetsResponse = {
  dataSource: Pick<DataSource, "id" | "title" | "sourceStatus">;
  sheets: DataSourceSheet[];
};

export type PreviewDataSourceBody = {
  sourceSheetId: string;
  rangeA1Notation?: string | null;
  useFirstRowAsHeader: boolean;
};

export type DataSourcePreview = {
  dataSourceId: string;
  sourceSheetId: string;
  sheetName: string;
  rangeA1Notation: string | null;
  headers: string[];
  rows: string[][];
  rowCount: number;
  previewedAt: string;
};
