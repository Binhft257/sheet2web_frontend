"use client";

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
          email:
            typeof parsedDraft.email === "string" ? parsedDraft.email : "",
          password:
            typeof parsedDraft.password === "string"
              ? parsedDraft.password
              : "",
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

    window.sessionStorage.setItem(SIGN_IN_DRAFT_KEY, JSON.stringify(values));
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
      router.push("/");
      router.refresh();
    } catch {
      setSubmitError("Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
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
              Chào mừng trở lại
            </h1>
            <p className="text-center text-sm text-slate-600 sm:text-base">
              Đăng nhập để tiếp tục với không gian làm việc của bạn.
            </p>
          </div>

          {showRegisteredSuccess ? (
            <p className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-700">
              Bạn đã đăng ký thành công. Vui lòng đăng nhập.
            </p>
          ) : null}

          <form
            className="space-y-5 sm:space-y-6"
            method="post"
            noValidate
            onSubmit={handleSubmit}
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
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={Boolean(errors.email)}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="email"
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="ten@congty.com"
                  type="email"
                  value={values.email}
                />
              </div>
              {errors.email ? (
                <p className="text-sm text-brown-600" id="email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  className="block text-sm font-medium text-slate-900"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <a
                  className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-600"
                  href="/forgot-password"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <LockIcon />
                </div>
                <input
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  aria-invalid={Boolean(errors.password)}
                  className="block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-shadow outline-none placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  id="password"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                />
                <button
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 transition-colors hover:text-slate-700"
                  onClick={() => setShowPassword((previous) => !previous)}
                  type="button"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-brown-600" id="password-error">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <SharedButton
              className="w-full"
              disabled={isSubmitting}
              size="lg"
              type="submit"
              variant="primary"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </SharedButton>

            {submitError ? (
              <p className="text-center text-sm text-brown-600">
                {submitError}
              </p>
            ) : null}
          </form>

          <p className="mt-7 text-center text-sm text-slate-600 sm:mt-8">
            Chưa có tài khoản?{" "}
            <a
              className="font-medium text-blue-500 transition-colors hover:text-blue-600"
              href="/sign-up"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      <RetryActivationModal
        defaultEmail={retryModalEmail}
        onClose={() => setIsRetryModalOpen(false)}
        onVerified={() => {
          setIsRetryModalOpen(false);
          router.push("/sign-in?registered=1");
        }}
        open={isRetryModalOpen}
      />
    </section>
  );
}

