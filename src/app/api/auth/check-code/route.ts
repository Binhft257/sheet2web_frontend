import { NextResponse } from "next/server";

type CheckCodeRequestBody = {
  id?: string;
  code?: string;
};

type CheckCodeSuccessResponse = {
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

    const body = (await request.json()) as CheckCodeRequestBody;
    const id = body.id?.trim();
    const code = body.code?.trim();

    if (!id || !code) {
      return NextResponse.json(
        { message: "Thiếu id hoặc mã xác minh." },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${baseApiUrl}/api/auth/check-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        code,
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
            "Không thể xác minh mã lúc này. Vui lòng thử lại.",
          ),
        },
        { status: backendResponse.status },
      );
    }

    let successBody: CheckCodeSuccessResponse | null = null;

    try {
      successBody = (await backendResponse.json()) as CheckCodeSuccessResponse;
    } catch {
      successBody = null;
    }

    return NextResponse.json(
      {
        message:
          successBody?.message ?? "Xác minh tài khoản thành công.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Không thể xác minh mã lúc này. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
