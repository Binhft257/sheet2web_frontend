import { auth } from "@/auth";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  message?: string | string[];
};

type BackendProxyOptions = {
  request: Request;
  backendPath: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  fallbackMessage: string;
  body?: unknown;
  forwardRequestBody?: boolean;
  forwardSearch?: boolean;
  invalidBodyMessage?: string;
  requireAuth?: boolean;
};

function extractErrorMessage(payload: unknown, fallbackMessage: string) {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  const message = (payload as ApiErrorResponse).message;
  if (Array.isArray(message)) {
    const firstMessage = message[0];
    return typeof firstMessage === "string" && firstMessage.trim()
      ? firstMessage
      : fallbackMessage;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallbackMessage;
}

export async function proxyBackendRequest({
  request,
  backendPath,
  method,
  fallbackMessage,
  body,
  forwardRequestBody = false,
  forwardSearch = false,
  invalidBodyMessage = "Dữ liệu gửi lên không hợp lệ.",
  requireAuth = true,
}: BackendProxyOptions) {
  try {
    const baseApiUrl = process.env.API_URL;
    if (!baseApiUrl) {
      return NextResponse.json(
        { message: "Thiếu cấu hình API_URL." },
        { status: 500 },
      );
    }

    const session = await auth();
    if (requireAuth && !session?.accessToken) {
      return NextResponse.json(
        { message: "Chưa được xác thực." },
        { status: 401 },
      );
    }

    let requestBody = body;
    if (forwardRequestBody) {
      try {
        requestBody = await request.json();
      } catch {
        return NextResponse.json(
          { message: invalidBodyMessage },
          { status: 400 },
        );
      }
    }

    const search = forwardSearch ? new URL(request.url).search : "";
    const backendResponse = await fetch(`${baseApiUrl}${backendPath}${search}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {}),
        ...(requestBody === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    });

    let payload: unknown = null;
    try {
      payload = await backendResponse.json();
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: extractErrorMessage(payload, fallbackMessage) },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(payload ?? { ok: true }, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json({ message: fallbackMessage }, { status: 500 });
  }
}
