import { auth } from "@/auth";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  message?: string | string[];
};

const PROFILE_ENDPOINTS = ["/api/auth/profile", "/api/auth/me", "/api/users/me"];

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

export async function GET() {
  const fallbackMessage = "Không thể tải thông tin người dùng.";

  try {
    const baseApiUrl = process.env.API_URL;
    if (!baseApiUrl) {
      return NextResponse.json(
        { message: "Thiếu cấu hình API_URL." },
        { status: 500 },
      );
    }

    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { message: "Chưa được xác thực." },
        { status: 401 },
      );
    }

    let lastStatus = 500;
    let lastPayload: unknown = null;

    for (const endpoint of PROFILE_ENDPOINTS) {
      const backendResponse = await fetch(`${baseApiUrl}${endpoint}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      let payload: unknown = null;
      try {
        payload = await backendResponse.json();
      } catch {
        payload = null;
      }

      if (backendResponse.ok) {
        return NextResponse.json(payload ?? { ok: true }, {
          status: backendResponse.status,
        });
      }

      lastStatus = backendResponse.status;
      lastPayload = payload;

      if (backendResponse.status !== 404) {
        break;
      }
    }

    return NextResponse.json(
      { message: extractErrorMessage(lastPayload, fallbackMessage) },
      { status: lastStatus },
    );
  } catch {
    return NextResponse.json({ message: fallbackMessage }, { status: 500 });
  }
}
