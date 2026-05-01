import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string; tokenId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id, tokenId } = await params;

  return proxyBackendRequest({
    request,
    backendPath: `/api/views/${encodeURIComponent(
      id,
    )}/share-tokens/${encodeURIComponent(tokenId)}/revoke`,
    method: "PATCH",
    fallbackMessage: "Không thể thu hồi link chia sẻ.",
  });
}
