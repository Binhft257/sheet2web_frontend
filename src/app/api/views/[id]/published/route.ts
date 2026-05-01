import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(id)}/published`,
    method: "PATCH",
    forwardRequestBody: true,
    fallbackMessage: "Không thể lưu cấu hình view đã xuất bản.",
    invalidBodyMessage: "Dữ liệu cập nhật view không hợp lệ.",
  });
}
