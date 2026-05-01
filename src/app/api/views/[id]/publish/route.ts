import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/publish`,
    method: "POST",
    fallbackMessage: "Không thể xuất bản view.",
  });
}
