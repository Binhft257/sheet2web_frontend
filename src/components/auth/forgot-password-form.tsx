"use client";

import AuthField, { AuthMessage } from "@/src/components/auth/auth-field";
import styles from "./auth.module.css";
import AuthShell from "@/src/components/auth/auth-shell";

import { SharedButton } from "@/src/components/share";
import {
  forgotPassword,
  resetPassword,
  type ForgotPasswordResponse,
} from "@/src/services/auth.service";
import AppLink from "@/src/components/app-link";
import { replaceAppPath } from "@/src/lib/app-path";
import { useRouter } from "next/navigation";
import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { z } from "zod";

const text = {
  backToSignIn: "Quay lại đăng nhập",
  code: "Mã xác minh",
  codePlaceholder: "Nhập mã từ email",
  confirmPassword: "Nhập lại mật khẩu mới",
  emailInvalid: "Email không đúng định dạng",
  emailRequired: "Vui lòng nhập email",
  forgotTitle: "Quên mật khẩu",
  forgotDescription: "Nhập email để nhận mã xác minh và đặt lại mật khẩu.",
  missingRequest: "Vui lòng gửi email để nhận mã xác minh trước.",
  newPassword: "Mật khẩu mới",
  passwordConfirmMismatch: "Mật khẩu xác nhận không khớp",
  passwordLetter: "Mật khẩu phải có chữ cái",
  passwordMin: "Mật khẩu phải có ít nhất 8 ký tự",
  passwordNumber: "Mật khẩu phải có ít nhất 1 chữ số",
  passwordRequired: "Vui lòng nhập mật khẩu mới",
  rememberPassword: "Nhớ mật khẩu rồi?",
  repeatPasswordRequired: "Vui lòng nhập lại mật khẩu",
  resetFallback: "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
  resetLoading: "Đang đặt lại mật khẩu...",
  resetSuccess: "Đặt lại mật khẩu thành công.",
  resetSubmit: "Đặt lại mật khẩu",
  sendCode: "Gửi mã xác minh",
  sendCodeFallback: "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.",
  sendCodeLoading: "Đang gửi mã...",
  sentMessage: "Mã xác minh đã được gửi. Vui lòng kiểm tra email.",
  sentTo: "Mã xác minh đã được gửi tới",
  validationCodeRequired: "Vui lòng nhập mã xác minh",
};

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, text.emailRequired).email(text.emailInvalid),
});

const resetPasswordSchema = z
  .object({
    code: z.string().trim().min(1, text.validationCodeRequired),
    password: z
      .string()
      .min(1, text.passwordRequired)
      .min(8, text.passwordMin)
      .regex(/[A-Za-z]/, text.passwordLetter)
      .regex(/[0-9]/, text.passwordNumber),
    confirmPassword: z.string().min(1, text.repeatPasswordRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: text.passwordConfirmMismatch,
    path: ["confirmPassword"],
  });

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ForgotPasswordField = keyof ForgotPasswordValues;
type ForgotPasswordErrors = Partial<Record<ForgotPasswordField, string>>;

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
type ResetPasswordField = keyof ResetPasswordValues;
type ResetPasswordErrors = Partial<Record<ResetPasswordField, string>>;

const initialForgotValues: ForgotPasswordValues = {
  email: "",
};

const initialResetValues: ResetPasswordValues = {
  code: "",
  password: "",
  confirmPassword: "",
};

function mapForgotErrors(
  error: z.ZodError<ForgotPasswordValues>,
): ForgotPasswordErrors {
  const nextErrors: ForgotPasswordErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field === "email" && !nextErrors[field]) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

function mapResetErrors(
  error: z.ZodError<ResetPasswordValues>,
): ResetPasswordErrors {
  const nextErrors: ResetPasswordErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "code" ||
        field === "password" ||
        field === "confirmPassword") &&
      !nextErrors[field]
    ) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [forgotValues, setForgotValues] =
    useState<ForgotPasswordValues>(initialForgotValues);
  const [resetValues, setResetValues] =
    useState<ResetPasswordValues>(initialResetValues);
  const [forgotErrors, setForgotErrors] = useState<ForgotPasswordErrors>({});
  const [resetErrors, setResetErrors] = useState<ResetPasswordErrors>({});
  const [requestInfo, setRequestInfo] = useState<ForgotPasswordResponse | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleForgotChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as ForgotPasswordField;

    if (field !== "email") {
      return;
    }

    setForgotValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setForgotErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleResetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as ResetPasswordField;

    if (
      field !== "code" &&
      field !== "password" &&
      field !== "confirmPassword"
    ) {
      return;
    }

    setResetValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setResetErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleForgotBlur = (event: FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as ForgotPasswordField;

    if (field !== "email") {
      return;
    }

    const fieldResult = forgotPasswordSchema.shape[field].safeParse(
      event.target.value,
    );

    setForgotErrors((previous) => ({
      ...previous,
      [field]: fieldResult.success
        ? undefined
        : fieldResult.error.issues[0]?.message,
    }));
  };

  const handleResetBlur = (event: FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as ResetPasswordField;

    if (
      field !== "code" &&
      field !== "password" &&
      field !== "confirmPassword"
    ) {
      return;
    }

    const result = resetPasswordSchema.safeParse({
      ...resetValues,
      [field]: event.target.value,
    });

    setResetErrors((previous) => {
      if (result.success) {
        return {
          ...previous,
          [field]: undefined,
        };
      }

      const issue = result.error.issues.find((item) => item.path[0] === field);

      return {
        ...previous,
        [field]: issue?.message,
      };
    });
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = forgotPasswordSchema.safeParse(forgotValues);

    if (!result.success) {
      setForgotErrors(mapForgotErrors(result.error));
      setSubmitError(null);
      return;
    }

    setForgotErrors({});
    setSubmitError(null);
    setSubmitMessage(null);
    setIsSendingCode(true);

    try {
      const response = await forgotPassword({
        email: result.data.email,
      });

      setRequestInfo(response);
      setSubmitMessage(text.sentMessage);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : text.sendCodeFallback,
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestInfo) {
      setSubmitMessage(null);
      setSubmitError(text.missingRequest);
      return;
    }

    const result = resetPasswordSchema.safeParse(resetValues);

    if (!result.success) {
      setResetErrors(mapResetErrors(result.error));
      setSubmitError(null);
      return;
    }

    setResetErrors({});
    setSubmitError(null);
    setSubmitMessage(null);
    setIsResettingPassword(true);

    try {
      await resetPassword({
        id: requestInfo.id,
        code: result.data.code,
        passwordHash: result.data.password,
      });

      setResetValues(initialResetValues);
      replaceAppPath(router, "/sign-in");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : text.resetFallback,
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <AuthShell
      title={text.forgotTitle}
      description={text.forgotDescription}
      footer={
        <p>
          {text.rememberPassword}{" "}
          <AppLink className={styles.link} href="/sign-in">
            {text.backToSignIn}
          </AppLink>
        </p>
      }
    >
      <form
        className={styles.form}
        method="post"
        noValidate
        onSubmit={handleForgotSubmit}
      >
        <AuthField
          label="Email"
          id="email"
          name="email"
          type="email"
          placeholder="ten@congty.com"
          value={forgotValues.email}
          error={forgotErrors.email}
          onBlur={handleForgotBlur}
          onChange={handleForgotChange}
        />
        <SharedButton
          className="w-full"
          disabled={isSendingCode}
          size="lg"
          type="submit"
        >
          {isSendingCode ? text.sendCodeLoading : text.sendCode}
        </SharedButton>
      </form>
      {requestInfo ? (
        <form
          className={`${styles.form} ${styles.resetForm}`}
          method="post"
          noValidate
          onSubmit={handleResetSubmit}
        >
          <AuthMessage tone="info">
            {text.sentTo} {requestInfo.email}.
          </AuthMessage>
          <input name="id" type="hidden" value={requestInfo.id} />
          <AuthField
            label={text.code}
            id="code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            placeholder={text.codePlaceholder}
            value={resetValues.code}
            error={resetErrors.code}
            onBlur={handleResetBlur}
            onChange={handleResetChange}
          />
          <AuthField
            label={text.newPassword}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={resetValues.password}
            error={resetErrors.password}
            onBlur={handleResetBlur}
            onChange={handleResetChange}
          />
          <AuthField
            label={text.confirmPassword}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={resetValues.confirmPassword}
            error={resetErrors.confirmPassword}
            onBlur={handleResetBlur}
            onChange={handleResetChange}
          />
          <SharedButton
            className="w-full"
            disabled={isResettingPassword}
            size="lg"
            type="submit"
          >
            {isResettingPassword ? text.resetLoading : text.resetSubmit}
          </SharedButton>
        </form>
      ) : null}
      {submitError ? <AuthMessage>{submitError}</AuthMessage> : null}
      {submitMessage ? (
        <AuthMessage tone="success">{submitMessage}</AuthMessage>
      ) : null}
    </AuthShell>
  );
}
