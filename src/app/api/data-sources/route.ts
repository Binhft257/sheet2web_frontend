import { auth } from "@/auth";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  message?: string | string[];
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

export async function GET(request: Request) {
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

    const queryString = new URL(request.url).search;
    const backendResponse = await fetch(
      `${baseApiUrl}/api/data-sources${queryString}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );

    let payload: unknown = null;
    try {
      payload = await backendResponse.json();
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: extractErrorMessage(
            payload,
            "Không thể tải danh sách nguồn dữ liệu.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Phản hồi từ dịch vụ nguồn không hợp lệ." },
        { status: 502 },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Không thể tải danh sách nguồn dữ liệu." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    let requestBody: unknown = null;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Dữ liệu thêm nguồn không hợp lệ." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${baseApiUrl}/api/data-sources`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    let payload: unknown = null;
    try {
      payload = await backendResponse.json();
    } catch {
      payload = null;
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: extractErrorMessage(
            payload,
            "Không thể thêm nguồn dữ liệu.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Phản hồi từ dịch vụ nguồn không hợp lệ." },
        { status: 502 },
      );
    }

    return NextResponse.json(payload, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { message: "Không thể thêm nguồn dữ liệu." },
      { status: 500 },
    );
  }
}
