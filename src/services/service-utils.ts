import axios from "axios";

type ServiceErrorPayload = {
  message?: string | string[];
};

export function buildQueryString(
  params: Record<string, number | string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  return searchParams.toString();
}

export function extractServiceErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (!axios.isAxiosError<ServiceErrorPayload>(error)) {
    return fallbackMessage;
  }

  const message = error.response?.data?.message;
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
