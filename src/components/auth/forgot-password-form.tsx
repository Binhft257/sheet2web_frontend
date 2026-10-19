"use client";

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
  forgotDescription:
    "Nhập email để nhận mã xác minh và đặt lại mật khẩu.",
  missingRequest:
    "Vui lòng gửi email để nhận mã xác minh trước.",
  newPassword: "Mật khẩu mới",
  passwordConfirmMismatch:
    "Mật khẩu xác nhận không khớp",
  passwordLetter: "Mật khẩu phải có chữ cái",
  passwordMin:
    "Mật khẩu phải có ít nhất 8 ký tự",
  passwordNumber:
    "Mật khẩu phải có ít nhất 1 chữ số",
  passwordRequired: "Vui lòng nhập mật khẩu mới",
  rememberPassword: "Nhớ mật khẩu rồi?",
  repeatPasswordRequired:
    "Vui lòng nhập lại mật khẩu",
  resetFallback:
    "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
  resetLoading:
    "Đang đặt lại mật khẩu...",
  resetSuccess:
    "Đặt lại mật khẩu thành công.",
  resetSubmit: "Đặt lại mật khẩu",
  sendCode: "Gửi mã xác minh",
  sendCodeFallback:
    "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.",
  sendCodeLoading: "Đang gửi mã...",
  sentMessage:
    "Mã xác minh đã được gửi. Vui lòng kiểm tra email.",
  sentTo: "Mã xác minh đã được gửi tới",
  validationCodeRequired:
    "Vui lòng nhập mã xác minh",
};

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, text.emailRequired)
    .email(text.emailInvalid),
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

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2.5" width="20" x="2" y="4" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <rect height="11" rx="2.5" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <circle cx="7.5" cy="14.5" r="3.5" />
      <path d="M10 12 21 1" />
      <path d="m16 6 2 2" />
      <path d="m13 9 2 2" />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8 text-blue-500"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2" width="16" x="4" y="4" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [forgotValues, setForgotValues] =
    useState<ForgotPasswordValues>(initialForgotValues);
  const [resetValues, setResetValues] =
    useState<ResetPasswordValues>(initialResetValues);
  const [forgotErrors, setForgotErrors] = useState<ForgotPasswordErrors>({});
  const [resetErrors, setResetErrors] = useState<ResetPasswordErrors>({});
  const [requestInfo, setRequestInfo] =
    useState<ForgotPasswordResponse | null>(null);
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
      setSubmitError(error instanceof Error ? error.message : text.sendCodeFallback);
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
      setSubmitError(error instanceof Error ? error.message : text.resetFallback);
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-7 flex flex-col items-center sm:mb-8">
            <div className="mb-5 flex items-center gap-2">
              <BrandIcon />
              <span className="text-2xl font-semibold text-slate-900">
                SheetToWeb
              </span>
            </div>
            <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
              {text.forgotTitle}
            </h1>
            <p className="text-center text-sm text-slate-600 sm:text-base">
              {text.forgotDescription}
            </p>
          </div>

          <form
            className="space-y-5 sm:space-y-6"
            method="post"
            noValidate
            onSubmit={handleForgotSubmit}
          >
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-900"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <MailIcon />
                </div>
                <input
                  aria-describedby={
                    forgotErrors.email ? "email-error" : undefined
                  }
                  aria-invalid={Boolean(forgotErrors.email)}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="email"
                  name="email"
                  onBlur={handleForgotBlur}
                  onChange={handleForgotChange}
                  placeholder="ten@congty.com"
                  type="email"
                  value={forgotValues.email}
                />
              </div>
              {forgotErrors.email ? (
                <p className="text-sm text-brown-600" id="email-error">
                  {forgotErrors.email}
                </p>
              ) : null}
            </div>

            <SharedButton
              className="w-full"
              disabled={isSendingCode}
              size="lg"
              type="submit"
              variant="primary"
            >
              {isSendingCode ? text.sendCodeLoading : text.sendCode}
            </SharedButton>
          </form>

          {requestInfo ? (
            <form
              className="mt-7 space-y-5 border-t border-neutral-200 pt-7 sm:mt-8 sm:space-y-6 sm:pt-8"
              method="post"
              noValidate
              onSubmit={handleResetSubmit}
            >
              <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {text.sentTo} {requestInfo.email}.
              </p>

              <input name="id" type="hidden" value={requestInfo.id} />

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="code"
                >
                  {text.code}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <KeyIcon />
                  </div>
                  <input
                    aria-describedby={
                      resetErrors.code ? "code-error" : undefined
                    }
                    aria-invalid={Boolean(resetErrors.code)}
                    autoComplete="one-time-code"
                    className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    id="code"
                    name="code"
                    onBlur={handleResetBlur}
                    onChange={handleResetChange}
                    placeholder={text.codePlaceholder}
                    type="text"
                    value={resetValues.code}
                  />
                </div>
                {resetErrors.code ? (
                  <p className="text-sm text-brown-600" id="code-error">
                    {resetErrors.code}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="password"
                >
                  {text.newPassword}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <LockIcon />
                  </div>
                  <input
                    aria-describedby={
                      resetErrors.password ? "password-error" : undefined
                    }
                    aria-invalid={Boolean(resetErrors.password)}
                    autoComplete="new-password"
                    className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    id="password"
                    name="password"
                    onBlur={handleResetBlur}
                    onChange={handleResetChange}
                    placeholder="********"
                    type="password"
                    value={resetValues.password}
                  />
                </div>
                {resetErrors.password ? (
                  <p className="text-sm text-brown-600" id="password-error">
                    {resetErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="confirmPassword"
                >
                  {text.confirmPassword}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <LockIcon />
                  </div>
                  <input
                    aria-describedby={
                      resetErrors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    aria-invalid={Boolean(resetErrors.confirmPassword)}
                    autoComplete="new-password"
                    className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    id="confirmPassword"
                    name="confirmPassword"
                    onBlur={handleResetBlur}
                    onChange={handleResetChange}
                    placeholder="********"
                    type="password"
                    value={resetValues.confirmPassword}
                  />
                </div>
                {resetErrors.confirmPassword ? (
                  <p
                    className="text-sm text-brown-600"
                    id="confirm-password-error"
                  >
                    {resetErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <SharedButton
                className="w-full"
                disabled={isResettingPassword}
                size="lg"
                type="submit"
                variant="primary"
              >
                {isResettingPassword ? text.resetLoading : text.resetSubmit}
              </SharedButton>
            </form>
          ) : null}

          {submitError ? (
            <p className="mt-5 text-center text-sm text-brown-600">
              {submitError}
            </p>
          ) : null}
          {submitMessage ? (
            <p className="mt-5 text-center text-sm text-blue-600">
              {submitMessage}
            </p>
          ) : null}

          <p className="mt-7 text-center text-sm text-slate-600 sm:mt-8">
            {text.rememberPassword}{" "}
            <AppLink
              className="font-medium text-blue-500 transition-colors hover:text-blue-600"
              href="/sign-in"
            >
              {text.backToSignIn}
            </AppLink>
          </p>
        </div>
      </div>
    </section>
  );
}
