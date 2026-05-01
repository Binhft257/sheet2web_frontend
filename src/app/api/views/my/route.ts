import { auth } from "@/auth";
import { NextResponse } from "next/server";

type ApiErrorResponse = {
  message?: string | string[];
};

type ViewListPayload = {
  items?: Array<Record<string, unknown>>;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

async function enrichViewSettings(
  baseApiUrl: string,
  accessToken: string,
  payload: Record<string, unknown>,
) {
  const items = (payload as ViewListPayload).items;
  if (!Array.isArray(items) || items.length === 0) {
    return payload;
  }

  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const id = typeof item.id === "string" ? item.id : null;
      if (!id || item.settingsJson !== undefined) {
        return item;
      }

      try {
        const detailResponse = await fetch(
          `${baseApiUrl}/api/views/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!detailResponse.ok) {
          return item;
        }

        const detailPayload: unknown = await detailResponse.json();
        if (!isRecord(detailPayload)) {
          return item;
        }

        return {
          ...item,
          settingsJson: detailPayload.settingsJson ?? null,
        };
      } catch {
        return item;
      }
    }),
  );

  return {
    ...payload,
    items: enrichedItems,
  };
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
    const backendResponse = await fetch(`${baseApiUrl}/api/views/my${queryString}`, {
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
        {
          message: extractErrorMessage(payload, "Không thể tải danh sách view."),
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

    const enrichedPayload = await enrichViewSettings(
      baseApiUrl,
      session.accessToken,
      payload as Record<string, unknown>,
    );

    return NextResponse.json(enrichedPayload, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Không thể tải danh sách view." },
      { status: 500 },
    );
  }
}
