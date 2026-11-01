"use client";

import AuthField, { AuthMessage } from "@/src/components/auth/auth-field";
import styles from "./auth.module.css";
import Modal from "@/src/components/common/modal";

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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the existing activation draft.
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the existing feedback when the dialog opens.
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
    <Modal
      open={open}
      title="Kích hoạt tài khoản"
      description="Tài khoản của bạn chưa được kích hoạt. Vui lòng gửi lại mã xác minh để kích hoạt tài khoản."
      onClose={handleClose}
      size="sm"
    >
      <div className="ui-modal-body">
        {infoMessage ? (
          <AuthMessage tone="info">{infoMessage}</AuthMessage>
        ) : null}
        {errorMessage ? <AuthMessage>{errorMessage}</AuthMessage> : null}
        {step === "retry" ? (
          <form
            className={styles.form}
            method="post"
            onSubmit={handleRetrySubmit}
          >
            <AuthField
              label="Email"
              autoComplete="email"
              id="retry-email"
              name="email"
              type="email"
              placeholder="ten@congty.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className={styles.modalActions}>
              <SharedButton
                disabled={isRetryLoading}
                onClick={handleClose}
                variant="outlined"
              >
                Hủy
              </SharedButton>
              <SharedButton disabled={isRetryLoading} type="submit">
                {isRetryLoading ? "Đang gửi..." : "Gửi lại mã"}
              </SharedButton>
            </div>
          </form>
        ) : (
          <form
            className={styles.form}
            method="post"
            onSubmit={handleVerifySubmit}
          >
            <input name="id" type="hidden" value={activationId ?? ""} />
            <AuthField
              label="Mã xác minh"
              autoComplete="one-time-code"
              id="activation-code"
              name="code"
              type="text"
              placeholder="Nhập mã xác minh"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <div className={styles.modalActions}>
              <SharedButton
                disabled={isVerifyLoading}
                onClick={() => {
                  setStep("retry");
                  setCode("");
                  setErrorMessage(null);
                }}
                variant="outlined"
              >
                Quay lại
              </SharedButton>
              <SharedButton disabled={isVerifyLoading} type="submit">
                {isVerifyLoading ? "Đang xác minh..." : "Xác minh"}
              </SharedButton>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
