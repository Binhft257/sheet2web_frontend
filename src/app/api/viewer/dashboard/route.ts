import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

export async function GET(request: Request) {
  return proxyBackendRequest({
    request,
    backendPath: "/api/viewer/dashboard",
    method: "GET",
    fallbackMessage: "Không thể tải tổng quan người xem.",
  });
}
