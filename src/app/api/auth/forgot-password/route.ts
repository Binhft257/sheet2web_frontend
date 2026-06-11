import { NextResponse } from "next/server";

type ForgotPasswordRequestBody = {
  email?: string;
};

type ForgotPasswordSuccessResponse = {
  id?: string;
  email?: string;
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

    const body = (await request.json()) as ForgotPasswordRequestBody;
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json(
        { message: "Vui lòng nhập email." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${baseApiUrl}/api/auth/forgot-password`, {
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
            "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    let successBody: ForgotPasswordSuccessResponse | null = null;

    try {
      successBody =
        (await backendResponse.json()) as ForgotPasswordSuccessResponse;
    } catch {
      successBody = null;
    }

    if (!successBody?.id || !successBody?.email) {
      return NextResponse.json(
        {
          message:
            "Gửi yêu cầu thành công nhưng không nhận được thông tin đặt lại mật khẩu.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        id: successBody.id,
        email: successBody.email,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
