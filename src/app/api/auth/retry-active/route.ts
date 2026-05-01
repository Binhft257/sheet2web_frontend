import { NextResponse } from "next/server";

type RetryActiveRequestBody = {
  email?: string;
};

type RetryActiveSuccessResponse = {
  id?: string;
  message?: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

function extractMessage(errorBody: ApiErrorResponse | null, fallback: string) {
  if (!errorBody?.message) {
    return fallback;
  }

  if (Array.isArray(errorBody.message)) {
    return errorBody.message[0] ?? fallback;
  }

  return errorBody.message;
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

    const body = (await request.json()) as RetryActiveRequestBody;
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json(
        { message: "Vui lòng nhập email." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${baseApiUrl}/api/auth/retry-active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    if (!backendResponse.ok) {
      let errorBody: ApiErrorResponse | null = null;

      try {
        errorBody = (await backendResponse.json()) as ApiErrorResponse;
      } catch {
        errorBody = null;
      }

      return NextResponse.json(
        {
          message: extractMessage(
            errorBody,
            "Không thể gửi lại mã kích hoạt. Vui lòng thử lại.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    let successBody: RetryActiveSuccessResponse | null = null;

    try {
      successBody =
        (await backendResponse.json()) as RetryActiveSuccessResponse;
    } catch {
      successBody = null;
    }

    if (!successBody?.id) {
      return NextResponse.json(
        {
          message:
            "Gửi lại mã thành công nhưng không nhận được id người dùng.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        id: successBody.id,
        message: successBody?.message ?? "Đã gửi lại mã kích hoạt.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Không thể gửi lại mã kích hoạt. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
