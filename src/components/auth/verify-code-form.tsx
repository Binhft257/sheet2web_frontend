"use client";

import AuthField, { AuthMessage } from "@/src/components/auth/auth-field";
import styles from "./auth.module.css";

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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the existing verification draft.
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
      className={styles.form}
      method="post"
      noValidate
      onSubmit={handleSubmit}
    >
      <input name="id" type="hidden" value={verifyId} />
      <AuthField
        label="Mã xác minh"
        id="code"
        name="code"
        type="text"
        autoComplete="one-time-code"
        placeholder="Nhập mã từ email"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <SharedButton
        className="w-full"
        disabled={isSubmitting}
        size="lg"
        type="submit"
      >
        {isSubmitting ? "Đang kiểm tra mã..." : "Gửi mã xác minh"}
      </SharedButton>
      {submitError ? <AuthMessage>{submitError}</AuthMessage> : null}
      {submitMessage ? (
        <AuthMessage tone="success">{submitMessage}</AuthMessage>
      ) : null}
      <AppLink className={styles.link} href="/sign-in">
        Quay lại đăng nhập
      </AppLink>
    </form>
  );
}
