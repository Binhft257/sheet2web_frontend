import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string; permissionId: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id, permissionId } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(
      id,
    )}/permissions/${encodeURIComponent(permissionId)}`,
    method: "DELETE",
    fallbackMessage: "Không thể gỡ quyền xem view.",
  });
}
