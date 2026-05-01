import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/permissions`,
    method: "GET",
    fallbackMessage: "Không thể tải danh sách phân quyền.",
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/permissions`,
    method: "POST",
    forwardRequestBody: true,
    fallbackMessage: "Không thể cấp quyền xem view.",
    invalidBodyMessage: "Dữ liệu cấp quyền không hợp lệ.",
  });
}
