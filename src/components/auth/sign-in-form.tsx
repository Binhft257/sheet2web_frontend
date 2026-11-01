"use client";

import AuthField, { AuthMessage } from "@/src/components/auth/auth-field";
import styles from "./auth.module.css";
import AuthShell from "@/src/components/auth/auth-shell";

import { SharedButton } from "@/src/components/share";
import RetryActivationModal from "@/src/components/auth/RetryActivationModal";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { z } from "zod";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignInField = keyof SignInValues;
type SignInErrors = Partial<Record<SignInField, string>>;
type SignInFormProps = {
  showRegisteredSuccess?: boolean;
};

const initialValues: SignInValues = {
  email: "",
  password: "",
};
const SIGN_IN_DRAFT_KEY = "sign-in-form-draft";
const APP_PREFIX = process.env.NODE_ENV === "production" ? "/sheet2web" : "";

function mapErrors(error: z.ZodError<SignInValues>): SignInErrors {
  const nextErrors: SignInErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "email" || field === "password") && !nextErrors[field]) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

function EyeIcon() {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
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
      <path d="M3 3l18 18" />
      <path d="M10.7 10.7a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 4.2A10 10 0 0 1 12 4c5.6 0 10 5 10 8-1 2-2.5 3.6-4.3 4.8" />
      <path d="M6.2 6.3C3.8 8 2 10.2 2 12c1.2 2.4 3 4.1 5.2 5.4" />
    </svg>
  );
}

export default function SignInForm({
  showRegisteredSuccess = false,
}: SignInFormProps) {
  const router = useRouter();
  const allowCleanupRef = useRef(false);
  const [values, setValues] = useState<SignInValues>(initialValues);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [retryModalEmail, setRetryModalEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(SIGN_IN_DRAFT_KEY);
    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as Partial<SignInValues>;
      const timer = window.setTimeout(() => {
        setValues((previous) => ({
          ...previous,
          email: typeof parsedDraft.email === "string" ? parsedDraft.email : "",
          password: "",
        }));
      }, 0);

      return () => window.clearTimeout(timer);
    } catch {
      window.sessionStorage.removeItem(SIGN_IN_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      SIGN_IN_DRAFT_KEY,
      JSON.stringify({ email: values.email }),
    );
  }, [values]);

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

      window.sessionStorage.removeItem(SIGN_IN_DRAFT_KEY);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as SignInField;

    if (field !== "email" && field !== "password") {
      return;
    }

    setValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as SignInField;

    if (field !== "email" && field !== "password") {
      return;
    }

    const fieldResult = signInSchema.shape[field].safeParse(event.target.value);

    setErrors((previous) => ({
      ...previous,
      [field]: fieldResult.success
        ? undefined
        : fieldResult.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signInSchema.safeParse(values);

    if (!result.success) {
      setErrors(mapErrors(result.error));
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);

    try {
      setIsSubmitting(true);

      const response = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      });

      if (response?.code?.startsWith("account_not_verified")) {
        setRetryModalEmail(result.data.email.trim());
        setIsRetryModalOpen(true);
        return;
      }

      if (response?.error) {
        setSubmitError("Email hoặc mật khẩu không đúng.");
        return;
      }

      window.sessionStorage.removeItem(SIGN_IN_DRAFT_KEY);
      if (APP_PREFIX) {
        window.location.assign(`${APP_PREFIX}/`);
      } else {
        router.push(`${APP_PREFIX}/`);
        router.refresh();
      }
    } catch {
      setSubmitError("Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthShell
        title="Chào mừng trở lại"
        description="Đăng nhập để tiếp tục với không gian làm việc của bạn."
        footer={
          <p>
            Chưa có tài khoản?{" "}
            <a className={styles.link} href={`${APP_PREFIX}/sign-up`}>
              Đăng ký ngay
            </a>
          </p>
        }
      >
        {showRegisteredSuccess ? (
          <AuthMessage tone="success">
            Bạn đã đăng ký thành công. Vui lòng đăng nhập.
          </AuthMessage>
        ) : null}
        <form
          className={styles.form}
          method="post"
          noValidate
          onSubmit={handleSubmit}
        >
          <AuthField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="ten@congty.com"
            value={values.email}
            error={errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <AuthField
            label="Mật khẩu"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={values.password}
            error={errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            labelAction={
              <a className={styles.link} href={`${APP_PREFIX}/forgot-password`}>
                Quên mật khẩu?
              </a>
            }
            trailingAction={
              <button
                className={styles.visibility}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((previous) => !previous)}
                type="button"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          <SharedButton
            className="w-full"
            disabled={isSubmitting}
            size="lg"
            type="submit"
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </SharedButton>
          {submitError ? <AuthMessage>{submitError}</AuthMessage> : null}
        </form>
      </AuthShell>
      <RetryActivationModal
        defaultEmail={retryModalEmail}
        onClose={() => setIsRetryModalOpen(false)}
        onVerified={() => {
          setIsRetryModalOpen(false);
          if (APP_PREFIX) {
            window.location.assign(`${APP_PREFIX}/sign-in?registered=1`);
          } else {
            router.push(`${APP_PREFIX}/sign-in?registered=1`);
          }
        }}
        open={isRetryModalOpen}
      />
    </>
  );
}
