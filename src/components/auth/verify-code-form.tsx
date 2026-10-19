"use client";

import { SharedButton } from "@/src/components/share";
import AppLink from "@/src/components/app-link";
import { appPath, pushAppPath } from "@/src/lib/app-path";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

type VerifyCodeFormProps = {
  verifyId: string;
};

type CheckCodeErrorResponse = {
  message?: string;
};

const VERIFY_CODE_DRAFT_PREFIX = "verify-code-form-draft";

export default function VerifyCodeForm({ verifyId }: VerifyCodeFormProps) {
  const router = useRouter();
  const allowCleanupRef = useRef(false);
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draftKey = `${VERIFY_CODE_DRAFT_PREFIX}:${verifyId}`;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(draftKey);
    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as { code?: string };
      if (typeof parsedDraft.code === "string") {
        setCode(parsedDraft.code);
      }
    } catch {
      window.sessionStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      draftKey,
      JSON.stringify({
        code,
      }),
    );
  }, [code, draftKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timer = window.setTimeout(() => {
      allowCleanupRef.current = true;
    }, 0);

    return () => {
      window.clearTimeout(timer);

      // Skip the first synthetic unmount in React Strict Mode (dev only).
      if (!allowCleanupRef.current) {
        return;
      }

      window.sessionStorage.removeItem(draftKey);
    };
  }, [draftKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setSubmitMessage(null);
      setSubmitError("Vui lòng nhập mã xác minh.");
      return;
    }

    setSubmitError(null);
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      console.log("Payload gửi xác minh:", {
        id: verifyId,
        code: trimmedCode,
      });

      const response = await fetch(appPath("/api/auth/check-code"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: verifyId,
          code: trimmedCode,
        }),
      });

      console.log("Trạng thái phản hồi Next API:", response.status);

      if (!response.ok) {
        let errorBody: CheckCodeErrorResponse | null = null;

        try {
          errorBody = (await response.json()) as CheckCodeErrorResponse;
        } catch {
          errorBody = null;
        }

        setSubmitError(
          errorBody?.message ?? "Xác minh thất bại. Vui lòng thử lại.",
        );
        return;
      }

      window.sessionStorage.removeItem(draftKey);
      pushAppPath(router, "/sign-in?registered=1");
    } catch {
      setSubmitError("Xác minh thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="mt-6 space-y-4"
      method="post"
      noValidate
      onSubmit={handleSubmit}
    >
      <input name="id" type="hidden" value={verifyId} />

      <div>
        <label
          className="mb-1 block text-left text-sm font-medium text-slate-900"
          htmlFor="code"
        >
          Mã xác minh
        </label>
        <input
          autoComplete="one-time-code"
          className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          id="code"
          name="code"
          onChange={(event) => setCode(event.target.value)}
          placeholder="Nhập mã từ email"
          type="text"
          value={code}
        />
      </div>

      <SharedButton
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "Đang kiểm tra mã..." : "Gửi mã xác minh"}
      </SharedButton>

      {submitError ? (
        <p className="text-sm text-brown-600">{submitError}</p>
      ) : null}
      {submitMessage ? (
        <p className="text-sm text-blue-600">{submitMessage}</p>
      ) : null}

      <AppLink
        className="inline-flex text-sm font-medium text-blue-500 underline transition-colors hover:text-blue-600"
        href="/sign-in"
      >
        Quay lại đăng nhập
      </AppLink>
    </form>
  );
}
