import { NextResponse } from "next/server";

type ResetPasswordRequestBody = {
  id?: string;
  code?: string;
  passwordHash?: string;
};

type ResetPasswordSuccessResponse = {
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

    const body = (await request.json()) as ResetPasswordRequestBody;
    const id = body.id?.trim();
    const code = body.code?.trim();
    const passwordHash = body.passwordHash;

    if (!id || !code || !passwordHash) {
      return NextResponse.json(
        {
          message:
            "Thiếu thông tin đặt lại mật khẩu.",
        },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${baseApiUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        code,
        passwordHash,
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
            "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    let successBody: ResetPasswordSuccessResponse | null = null;

    try {
      successBody =
        (await backendResponse.json()) as ResetPasswordSuccessResponse;
    } catch {
      successBody = null;
    }

    return NextResponse.json(
      {
        message: successBody?.message ?? "Reset password successfully",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message:
          "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
      },
      { status: 500 },
    );
  }
}
