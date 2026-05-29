import type { PaginatedResponse } from "@/src/types/pagination";
import type { ViewAccessMode } from "@/src/types/view";

export type ViewerSharedViewOwner = {
  id: string;
  fullName: string;
  email: string;
};

export type ViewerSharedViewSnapshot = {
  id: string;
  versionNo?: number;
  rowCount: number;
  fetchedAt: string;
  syncStatus?: string;
};

export type ViewerSharedView = {
  id: string;
  name: string;
  slug: string;
  accessMode: ViewAccessMode;
  permissionType: "view" | string;
  owner: ViewerSharedViewOwner;
  snapshot: ViewerSharedViewSnapshot | null;
  sharedAt: string;
  url: string;
};

export type ViewerDashboardResponse = {
  totalSharedViews: number;
  recentSharedViews: ViewerSharedView[];
};

export type ViewerViewsResponse = PaginatedResponse<ViewerSharedView>;

export type GetViewerViewsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "latest" | string;
};
