import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/data-sources/${encodeURIComponent(id)}`,
    method: "PATCH",
    forwardRequestBody: true,
    fallbackMessage: "Không thể cập nhật nguồn dữ liệu.",
    invalidBodyMessage: "Dữ liệu cập nhật không hợp lệ.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/data-sources/${encodeURIComponent(id)}`,
    method: "DELETE",
    fallbackMessage: "Không thể xóa nguồn dữ liệu.",
  });
}
