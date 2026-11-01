"use client";

import AuthField, { AuthMessage } from "@/src/components/auth/auth-field";
import styles from "./auth.module.css";
import AuthShell from "@/src/components/auth/auth-shell";

import { SharedButton } from "@/src/components/share";
import AppLink from "@/src/components/app-link";
import { appPath, pushAppPath } from "@/src/lib/app-path";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { z } from "zod";

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Vui lòng nhập họ tên hợp lệ"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không đúng định dạng"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải có chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
    terms: z
      .boolean()
      .refine((value) => value, "Bạn cần đồng ý điều khoản để tiếp tục"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;
type SignUpField = keyof SignUpValues;
type SignUpErrors = Partial<Record<SignUpField, string>>;

type RegisterSuccessResponse = {
  id?: string;
};

type RegisterErrorResponse = {
  message?: string;
};

const initialValues: SignUpValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};
const SIGN_UP_DRAFT_KEY = "sign-up-form-draft";

function mapErrors(error: z.ZodError<SignUpValues>): SignUpErrors {
  const nextErrors: SignUpErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === "fullName" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword" ||
        field === "terms") &&
      !nextErrors[field]
    ) {
      nextErrors[field] = issue.message;
    }
  }

  return nextErrors;
}

function getFieldError(field: SignUpField, values: SignUpValues) {
  const result = signUpSchema.safeParse(values);
  if (result.success) {
    return undefined;
  }

  const issue = result.error.issues.find((item) => item.path[0] === field);
  return issue?.message;
}

export default function SignUpForm() {
  const router = useRouter();
  const allowCleanupRef = useRef(false);
  const [values, setValues] = useState<SignUpValues>(initialValues);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(SIGN_UP_DRAFT_KEY);
    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as Partial<SignUpValues>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the existing browser draft on mount.
      setValues((previous) => ({
        ...previous,
        fullName:
          typeof parsedDraft.fullName === "string" ? parsedDraft.fullName : "",
        email: typeof parsedDraft.email === "string" ? parsedDraft.email : "",
        password:
          typeof parsedDraft.password === "string" ? parsedDraft.password : "",
        confirmPassword:
          typeof parsedDraft.confirmPassword === "string"
            ? parsedDraft.confirmPassword
            : "",
        terms:
          typeof parsedDraft.terms === "boolean" ? parsedDraft.terms : false,
      }));
    } catch {
      window.sessionStorage.removeItem(SIGN_UP_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(SIGN_UP_DRAFT_KEY, JSON.stringify(values));
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

      window.sessionStorage.removeItem(SIGN_UP_DRAFT_KEY);
    };
  }, []);

  const strengthScore = useMemo(() => {
    const checks = [
      values.password.length >= 8,
      /[a-z]/.test(values.password) && /[A-Z]/.test(values.password),
      /[0-9]/.test(values.password),
      /[^A-Za-z0-9]/.test(values.password),
    ];
    return checks.filter(Boolean).length;
  }, [values.password]);

  const strengthLabel =
    strengthScore <= 1
      ? "Mật khẩu yếu"
      : strengthScore === 2
        ? "Mật khẩu trung bình"
        : strengthScore === 3
          ? "Mật khẩu khá"
          : "Mật khẩu mạnh";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as SignUpField;
    if (
      field !== "fullName" &&
      field !== "email" &&
      field !== "password" &&
      field !== "confirmPassword" &&
      field !== "terms"
    ) {
      return;
    }

    const nextValue =
      field === "terms" ? event.target.checked : event.target.value;

    setValues((previous) => {
      const next = {
        ...previous,
        [field]: nextValue,
      } as SignUpValues;

      if (field === "password" || field === "confirmPassword") {
        const confirmPasswordError = getFieldError("confirmPassword", next);
        setErrors((previousErrors) => ({
          ...previousErrors,
          [field]: undefined,
          confirmPassword: confirmPasswordError,
        }));
      } else {
        setErrors((previousErrors) => ({
          ...previousErrors,
          [field]: undefined,
        }));
      }

      return next;
    });
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as SignUpField;
    if (
      field !== "fullName" &&
      field !== "email" &&
      field !== "password" &&
      field !== "confirmPassword" &&
      field !== "terms"
    ) {
      return;
    }

    setErrors((previous) => ({
      ...previous,
      [field]: getFieldError(field, values),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signUpSchema.safeParse(values);
    if (!result.success) {
      setErrors(mapErrors(result.error));
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const registerResponse = await fetch(appPath("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: result.data.fullName,
          email: result.data.email,
          password: result.data.password,
        }),
      });

      if (!registerResponse.ok) {
        let errorBody: RegisterErrorResponse | null = null;

        try {
          errorBody = (await registerResponse.json()) as RegisterErrorResponse;
        } catch {
          errorBody = null;
        }

        setSubmitError(
          errorBody?.message ?? "Không thể đăng ký lúc này. Vui lòng thử lại.",
        );
        return;
      }

      const data = (await registerResponse.json()) as RegisterSuccessResponse;
      if (!data.id) {
        setSubmitError("Không nhận được id tạm cho bước xác minh.");
        return;
      }

      window.sessionStorage.removeItem(SIGN_UP_DRAFT_KEY);
      window.localStorage.setItem(
        `verify-id:${result.data.email.trim().toLowerCase()}`,
        data.id,
      );
      pushAppPath(router, `/verify/${encodeURIComponent(data.id)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tạo tài khoản để chuyển bảng tính thành các view và chia sẻ dữ liệu của bạn."
      footer={
        <p>
          Đã có tài khoản?{" "}
          <AppLink className={styles.link} href="/sign-in">
            Đăng nhập
          </AppLink>
        </p>
      }
    >
      <form
        className={styles.form}
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <AuthField
          label="Họ tên"
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Nhập họ và tên của bạn"
          value={values.fullName}
          error={errors.fullName}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <AuthField
          label="Email công việc"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ten@doanhnghiep.com"
          value={values.email}
          error={errors.email}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <AuthField
          label="Mật khẩu"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Tạo mật khẩu"
          value={values.password}
          error={errors.password}
          onBlur={handleBlur}
          onChange={handleChange}
          help={
            <>
              <div className={styles.strength} aria-hidden="true">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} data-active={index < strengthScore} />
                ))}
              </div>
              <p>{strengthLabel}</p>
            </>
          }
        />
        <AuthField
          label="Xác nhận mật khẩu"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <div>
          <label className={styles.terms} htmlFor="terms">
            <input
              checked={values.terms}
              id="terms"
              name="terms"
              onBlur={handleBlur}
              onChange={handleChange}
              type="checkbox"
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <span>
              Tôi đồng ý với{" "}
              <a className={styles.link} href="#">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a className={styles.link} href="#">
                Chính sách bảo mật
              </a>
              .
            </span>
          </label>
          {errors.terms ? (
            <p className={styles.fieldError} id="terms-error">
              {errors.terms}
            </p>
          ) : null}
        </div>
        <SharedButton
          className="w-full"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </SharedButton>
        {submitError ? <AuthMessage>{submitError}</AuthMessage> : null}
      </form>
    </AuthShell>
  );
}
