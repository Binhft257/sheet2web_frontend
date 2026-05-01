import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/share-tokens`,
    method: "GET",
    fallbackMessage: "Không thể tải link chia sẻ.",
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/share-tokens`,
    method: "POST",
    forwardRequestBody: true,
    fallbackMessage: "Không thể tạo link chia sẻ.",
    invalidBodyMessage: "Dữ liệu tạo link chia sẻ không hợp lệ.",
  });
}
