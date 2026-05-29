import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

export async function GET(request: Request) {
  return proxyBackendRequest({
    request,
    backendPath: "/api/viewer/views",
    method: "GET",
    forwardSearch: true,
    fallbackMessage: "Không thể tải danh sách view được chia sẻ.",
  });
}
