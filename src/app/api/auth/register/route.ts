import { NextResponse } from 'next/server';

type RegisterRequestBody = {
  fullName?: string;
  email?: string;
  password?: string;
};

type RegisterSuccessResponse = {
  id?: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(errorBody: ApiErrorResponse | null) {
  if (!errorBody?.message) {
    return 'Đăng ký thất bại.';
  }

  if (Array.isArray(errorBody.message)) {
    return errorBody.message[0] ?? 'Đăng ký thất bại.';
  }

  return errorBody.message;
}

export async function POST(request: Request) {
  try {
    const baseApiUrl = process.env.API_URL;
    if (!baseApiUrl) {
      return NextResponse.json(
        { message: 'Thiếu cấu hình API_URL.' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as RegisterRequestBody;
    const fullName = body.fullName?.trim();
    const email = body.email?.trim();
    const password = body.password;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'Thiếu thông tin đăng ký.' },
        { status: 400 },
      );
    }

    const registerResponse = await fetch(`${baseApiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        fullName,
        email,
        passwordHash: password,
      }),
    });

    if (!registerResponse.ok) {
      let errorBody: ApiErrorResponse | null = null;

      try {
        errorBody = (await registerResponse.json()) as ApiErrorResponse;
      } catch {
        errorBody = null;
      }

      return NextResponse.json(
        { message: getErrorMessage(errorBody) },
        { status: registerResponse.status },
      );
    }

    const data = (await registerResponse.json()) as RegisterSuccessResponse;
    if (!data.id) {
      return NextResponse.json(
        { message: 'Đăng ký thành công nhưng không nhận được id người dùng.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Không thể đăng ký lúc này. Vui lòng thử lại.' },
      { status: 500 },
    );
  }
}

