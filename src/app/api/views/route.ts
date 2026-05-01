import { proxyBackendRequest } from "@/src/app/api/_utils/backend-proxy";

export async function POST(request: Request) {
  return proxyBackendRequest({
    request,
    backendPath: "/api/views",
    method: "POST",
    forwardRequestBody: true,
    fallbackMessage: "Không thể tạo bản nháp view.",
    invalidBodyMessage: "Dữ liệu tạo view không hợp lệ.",
  });
}
