import type { PaginatedResponse } from "@/src/types/pagination";

export type ViewStatus = "draft" | "published" | "archived" | "paused" | string;
export type ViewAccessMode = "public" | "private" | string;
export type ViewStatusFilter = "draft" | "published" | "archived";
export type ViewAccessModeFilter = "public" | "private";
export type ViewSelectionType = "full_sheet" | "range" | string;
export type ThemePreset = "modern" | "classic" | "minimal";
export type ViewJsonObject = Record<string, unknown>;

export type ViewDataSourceRef = {
  id: string;
  title: string;
  sourceType?: string;
  sourceStatus?: string;
  spreadsheetId?: string | null;
  lastSyncedStructureAt?: string | null;
};

export type ViewSourceSheetRef = {
  id: string;
  sheetName: string;
  googleSheetId?: number;
  gid?: string;
  sortOrder?: number;
  isHidden?: boolean;
  metadataJson?: ViewJsonObject | null;
};

export type ViewSnapshotRef = {
  id: string;
  versionNo: number;
  rowCount: number;
  fetchedAt: string;
};

export type OwnerView = {
  id: string;
  name: string;
  slug: string;
  status: ViewStatus;
  accessMode: ViewAccessMode;
  selectionType: ViewSelectionType;
  rangeA1Notation: string | null;
  useFirstRowAsHeader: boolean;
  refreshIntervalSeconds: number;
  allowThemeSwitch: boolean;
  themeId?: string | null;
  themeOverrideJson?: ViewJsonObject | null;
  settingsJson?: ViewJsonObject | null;
  lastPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  dataSource: ViewDataSourceRef | null;
  sourceSheet: ViewSourceSheetRef | null;
  currentSnapshot: ViewSnapshotRef | null;
  publicUrl?: string | null;
};

export type OwnerViewListResponse = PaginatedResponse<OwnerView>;

export type GetViewsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ViewStatusFilter;
  accessMode?: ViewAccessModeFilter;
};

export type OwnerViewDetail = OwnerView & {
  dataSourceId: string;
  sourceSheetId: string;
  themeId: string | null;
  themeOverrideJson: ViewJsonObject | null;
  settingsJson: ViewJsonObject | null;
};

export type CreateViewBody = {
  dataSourceId: string;
  sourceSheetId: string;
  name: string;
  selectionType: ViewSelectionType;
  rangeA1Notation?: string | null;
  accessMode: ViewAccessMode;
  useFirstRowAsHeader: boolean;
  refreshIntervalSeconds?: number;
  allowThemeSwitch: boolean;
  themeId?: string | null;
  themeOverrideJson?: ViewJsonObject;
  settingsJson?: ViewJsonObject;
};

export type UpdateViewBody = Partial<
  Omit<CreateViewBody, "dataSourceId">
>;

export type PublishViewResponse = {
  id: string;
  slug: string;
  status: ViewStatus;
  publishedAt: string;
  snapshot: {
    id: string;
    versionNo: number;
    rowCount: number;
    fetchedAt: string;
  };
  url: string;
};

export type PublishedViewInfo = {
  id: string;
  name: string;
  slug: string;
  accessMode: ViewAccessMode;
  refreshIntervalSeconds?: number;
  themeId: string | null;
  themeOverrideJson?: ViewJsonObject | null;
  settingsJson?: ViewJsonObject | null;
  allowThemeSwitch: boolean;
  lastPublishedAt: string | null;
};

export type PublishedViewSnapshot = {
  id: string;
  versionNo: number;
  headers: string[];
  rows: string[][];
  rowCount: number;
  fetchedAt: string;
};

export type PublishedView = {
  view: PublishedViewInfo;
  snapshot: PublishedViewSnapshot | null;
};

export type ViewPermissionUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type ViewPermission = {
  id: string;
  user?: ViewPermissionUser | null;
  email?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type CreateShareTokenBody = {
  name?: string;
  expiresAt?: string | null;
};

export type ViewShareToken = {
  id: string;
  name?: string | null;
  token?: string;
  url?: string;
  shareUrl?: string;
  isRevoked?: boolean;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string;
  lastUsedAt?: string | null;
  [key: string]: unknown;
};
