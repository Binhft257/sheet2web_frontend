import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/v/${encodeURIComponent(slug)}`,
    method: "GET",
    forwardSearch: true,
    requireAuth: false,
    fallbackMessage: "Không thể tải view đã xuất bản.",
  });
}
