import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/data-sources/${encodeURIComponent(id)}/preview`,
    method: "POST",
    forwardRequestBody: true,
    fallbackMessage: "Không thể xem trước dữ liệu.",
    invalidBodyMessage: "Dữ liệu xem trước không hợp lệ.",
  });
}
