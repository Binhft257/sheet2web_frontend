"use client";

import { SharedButton } from "@/src/components/share";
import {
  checkActivationCode,
  retryActivation,
} from "@/src/services/auth.service";
import { useEffect, useRef, useState, type FormEvent } from "react";

type RetryStep = "retry" | "verify";

type RetryActivationModalProps = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onVerified?: () => void;
};

type RetryActivationDraft = {
  step?: RetryStep;
  email?: string;
  activationId?: string | null;
  code?: string;
};

const RETRY_ACTIVATION_DRAFT_KEY = "retry-activation-modal-draft";

export default function RetryActivationModal({
  open,
  onClose,
  defaultEmail,
  onVerified,
}: RetryActivationModalProps) {
  const allowCleanupRef = useRef(false);

  const [step, setStep] = useState<RetryStep>("retry");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [activationId, setActivationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isRetryLoading, setIsRetryLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  const resetState = () => {
    setStep("retry");
    setEmail(defaultEmail ?? "");
    setActivationId(null);
    setCode("");
    setErrorMessage(null);
    setInfoMessage(null);
    setIsRetryLoading(false);
    setIsVerifyLoading(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(RETRY_ACTIVATION_DRAFT_KEY);
    if (!rawDraft) {
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as RetryActivationDraft;
      if (draft.step === "retry" || draft.step === "verify") {
        setStep(draft.step);
      }
      if (typeof draft.email === "string") {
        setEmail(draft.email);
      }
      if (typeof draft.code === "string") {
        setCode(draft.code);
      }
      setActivationId(
        typeof draft.activationId === "string" ? draft.activationId : null,
      );
    } catch {
      window.sessionStorage.removeItem(RETRY_ACTIVATION_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const draft: RetryActivationDraft = {
      step,
      email,
      activationId,
      code,
    };

    window.sessionStorage.setItem(
      RETRY_ACTIVATION_DRAFT_KEY,
      JSON.stringify(draft),
    );
  }, [activationId, code, email, step]);

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

      window.sessionStorage.removeItem(RETRY_ACTIVATION_DRAFT_KEY);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setInfoMessage(null);
      return;
    }

    setIsRetryLoading(false);
    setIsVerifyLoading(false);
  }, [open]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(RETRY_ACTIVATION_DRAFT_KEY);
    }

    resetState();
    onClose();
  };

  const handleRetrySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập email.");
      setInfoMessage(null);
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsRetryLoading(true);

    try {
      const response = await retryActivation({ email: trimmedEmail });

      setActivationId(response.id);
      setStep("verify");
      setCode("");
      setInfoMessage(
        response.message || "Đã gửi lại mã kích hoạt. Vui lòng kiểm tra email.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể gửi lại mã kích hoạt. Vui lòng thử lại.",
      );
    } finally {
      setIsRetryLoading(false);
    }
  };

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setErrorMessage("Vui lòng nhập mã xác minh.");
      return;
    }

    if (!activationId) {
      setErrorMessage("Không tìm thấy id xác minh. Vui lòng gửi lại mã.");
      setStep("retry");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsVerifyLoading(true);

    try {
      await checkActivationCode({
        id: activationId,
        code: trimmedCode,
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(RETRY_ACTIVATION_DRAFT_KEY);
      }

      onVerified?.();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Xác minh thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsVerifyLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <section className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Kích hoạt tài khoản
          </h2>
          <button
            aria-label="Đóng"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-slate-700"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Tài khoản của bạn chưa được kích hoạt. Vui lòng gửi lại mã xác minh để
          kích hoạt tài khoản.
        </p>

        {infoMessage ? (
          <p className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {infoMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {step === "retry" ? (
          <form className="space-y-4" method="post" onSubmit={handleRetrySubmit}>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-900"
                htmlFor="retry-email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                id="retry-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ten@congty.com"
                type="email"
                value={email}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <SharedButton
                disabled={isRetryLoading}
                onClick={handleClose}
                type="button"
                variant="secondary"
              >
                Hủy
              </SharedButton>
              <SharedButton
                disabled={isRetryLoading}
                type="submit"
                variant="primary"
              >
                {isRetryLoading ? "Đang gửi..." : "Gửi lại mã"}
              </SharedButton>
            </div>
          </form>
        ) : (
          <form className="space-y-4" method="post" onSubmit={handleVerifySubmit}>
            <input name="id" type="hidden" value={activationId ?? ""} />

            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-900"
                htmlFor="activation-code"
              >
                Mã xác minh
              </label>
              <input
                autoComplete="one-time-code"
                className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                id="activation-code"
                name="code"
                onChange={(event) => setCode(event.target.value)}
                placeholder="Nhập mã xác minh"
                type="text"
                value={code}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <SharedButton
                disabled={isVerifyLoading}
                onClick={() => {
                  setStep("retry");
                  setCode("");
                  setErrorMessage(null);
                }}
                type="button"
                variant="secondary"
              >
                Quay lại
              </SharedButton>
              <SharedButton
                disabled={isVerifyLoading}
                type="submit"
                variant="primary"
              >
                {isVerifyLoading ? "Đang xác minh..." : "Xác minh"}
              </SharedButton>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
