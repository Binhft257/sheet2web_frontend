import { auth } from "@/auth";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  message?: string | string[];
};

const PROFILE_ENDPOINT = "/api/users/me";

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

    const backendResponse = await fetch(`${baseApiUrl}${PROFILE_ENDPOINT}`, {
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
