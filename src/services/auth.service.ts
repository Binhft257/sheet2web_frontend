type ApiErrorResponse = {
  message?: string | string[];
};

export type RetryActivationRequest = {
  email: string;
};

export type RetryActivationResponse = {
  id: string;
  message: string;
};

export type CheckActivationCodeRequest = {
  id: string;
  code: string;
};

export type CheckActivationCodeResponse = {
  message: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  id: string;
  email: string;
};

export type ResetPasswordRequest = {
  id: string;
  code: string;
  passwordHash: string;
};

export type ResetPasswordResponse = {
  message: string;
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

async function postJson<TResponse>(
  endpoint: string,
  body: Record<string, string>,
  fallbackMessage: string,
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, fallbackMessage));
  }

  return payload as TResponse;
}

export async function retryActivation(
  body: RetryActivationRequest,
): Promise<RetryActivationResponse> {
  return postJson<RetryActivationResponse>(
    "/api/auth/retry-active",
    {
      email: body.email,
    },
    "Không thể gửi lại mã kích hoạt. Vui lòng thử lại.",
  );
}

export async function checkActivationCode(
  body: CheckActivationCodeRequest,
): Promise<CheckActivationCodeResponse> {
  return postJson<CheckActivationCodeResponse>(
    "/api/auth/check-code",
    {
      id: body.id,
      code: body.code,
    },
    "Không thể xác minh mã lúc này. Vui lòng thử lại.",
  );
}

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return postJson<ForgotPasswordResponse>(
    "/api/auth/forgot-password",
    {
      email: body.email,
    },
    "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.",
  );
}

export async function resetPassword(
  body: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return postJson<ResetPasswordResponse>(
    "/api/auth/reset-password",
    {
      id: body.id,
      code: body.code,
      passwordHash: body.passwordHash,
    },
    "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
  );
}
