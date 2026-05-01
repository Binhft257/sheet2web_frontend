'use client';

import { SharedButton } from '@/src/components/share';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { z } from 'zod';

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên hợp lệ'),
    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập email')
      .email('Email không đúng định dạng'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Za-z]/, 'Mật khẩu phải có chữ cái')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
    terms: z.boolean().refine((value) => value, 'Bạn cần đồng ý điều khoản để tiếp tục'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
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
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};
const SIGN_UP_DRAFT_KEY = 'sign-up-form-draft';

function mapErrors(error: z.ZodError<SignUpValues>): SignUpErrors {
  const nextErrors: SignUpErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      (field === 'fullName' ||
        field === 'email' ||
        field === 'password' ||
        field === 'confirmPassword' ||
        field === 'terms') &&
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

function PersonIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.75'
      viewBox='0 0 24 24'
    >
      <circle cx='12' cy='8' r='4' />
      <path d='M4 20a8 8 0 0 1 16 0' />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.75'
      viewBox='0 0 24 24'
    >
      <rect height='16' rx='2.5' width='20' x='2' y='4' />
      <path d='m3 6 9 7 9-7' />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-5 w-5'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.75'
      viewBox='0 0 24 24'
    >
      <rect height='11' rx='2.5' width='16' x='4' y='10' />
      <path d='M8 10V7a4 4 0 1 1 8 0v3' />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-8 w-8 text-blue-500'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.8'
      viewBox='0 0 24 24'
    >
      <rect height='16' rx='2' width='16' x='4' y='4' />
      <path d='M8 9h8M8 13h8M8 17h5' />
    </svg>
  );
}

export default function SignUpForm() {
  const router = useRouter();
  const allowCleanupRef = useRef(false);
  const [values, setValues] = useState<SignUpValues>(initialValues);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rawDraft = window.sessionStorage.getItem(SIGN_UP_DRAFT_KEY);
    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as Partial<SignUpValues>;
      setValues((previous) => ({
        ...previous,
        fullName: typeof parsedDraft.fullName === 'string' ? parsedDraft.fullName : '',
        email: typeof parsedDraft.email === 'string' ? parsedDraft.email : '',
        password: typeof parsedDraft.password === 'string' ? parsedDraft.password : '',
        confirmPassword: typeof parsedDraft.confirmPassword === 'string' ? parsedDraft.confirmPassword : '',
        terms: typeof parsedDraft.terms === 'boolean' ? parsedDraft.terms : false,
      }));
    } catch {
      window.sessionStorage.removeItem(SIGN_UP_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(SIGN_UP_DRAFT_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    if (typeof window === 'undefined') {
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
      ? 'Mật khẩu yếu'
      : strengthScore === 2
        ? 'Mật khẩu trung bình'
        : strengthScore === 3
          ? 'Mật khẩu khá'
          : 'Mật khẩu mạnh';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as SignUpField;
    if (
      field !== 'fullName' &&
      field !== 'email' &&
      field !== 'password' &&
      field !== 'confirmPassword' &&
      field !== 'terms'
    ) {
      return;
    }

    const nextValue = field === 'terms' ? event.target.checked : event.target.value;

    setValues((previous) => {
      const next = {
        ...previous,
        [field]: nextValue,
      } as SignUpValues;

      if (field === 'password' || field === 'confirmPassword') {
        const confirmPasswordError = getFieldError('confirmPassword', next);
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
      field !== 'fullName' &&
      field !== 'email' &&
      field !== 'password' &&
      field !== 'confirmPassword' &&
      field !== 'terms'
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
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

        setSubmitError(errorBody?.message ?? 'Không thể đăng ký lúc này. Vui lòng thử lại.');
        return;
      }

      const data = (await registerResponse.json()) as RegisterSuccessResponse;
      if (!data.id) {
        setSubmitError('Không nhận được id tạm cho bước xác minh.');
        return;
      }

      window.sessionStorage.removeItem(SIGN_UP_DRAFT_KEY);
      window.localStorage.setItem(`verify-id:${result.data.email.trim().toLowerCase()}`, data.id);
      router.push(`/verify/${encodeURIComponent(data.id)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='flex min-h-screen bg-neutral-50 text-slate-900'>
      <div className='flex w-full flex-col justify-center bg-white px-5 py-8 sm:px-10 lg:px-16'>
        <div className='mx-auto w-full max-w-md'>
          <div className='mb-8 flex items-center gap-2'>
            <BrandIcon />
            <span className='text-2xl font-semibold text-blue-500'>SheetToWeb</span>
          </div>

          <div className='mb-6'>
            <h1 className='mb-2 text-3xl font-semibold leading-tight text-slate-900'>Bắt đầu với Sheet-to-Web</h1>
            <p className='text-sm text-slate-600 sm:text-base'>
              Tạo tài khoản để chuyển đổi bảng tính của bạn thành ứng dụng web chuyên nghiệp.
            </p>
          </div>

          <form className='space-y-4' method='post' noValidate onSubmit={handleSubmit}>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-900' htmlFor='fullName'>
                Họ tên
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500'>
                  <PersonIcon />
                </div>
                <input
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  aria-invalid={Boolean(errors.fullName)}
                  className='block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  id='fullName'
                  name='fullName'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='Nhập họ và tên của bạn'
                  type='text'
                  value={values.fullName}
                />
              </div>
              {errors.fullName ? (
                <p className='mt-1 text-sm text-brown-600' id='fullName-error'>
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-900' htmlFor='email'>
                Email công việc
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500'>
                  <MailIcon />
                </div>
                <input
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete='email'
                  className='block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  id='email'
                  name='email'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='ten@doanhnghiep.com'
                  type='email'
                  value={values.email}
                />
              </div>
              {errors.email ? (
                <p className='mt-1 text-sm text-brown-600' id='email-error'>
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-900' htmlFor='password'>
                Mật khẩu
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500'>
                  <LockIcon />
                </div>
                <input
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete='new-password'
                  className='block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  id='password'
                  name='password'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='Tạo mật khẩu'
                  type='password'
                  value={values.password}
                />
              </div>
              <div className='mt-2 flex h-1 gap-1'>
                {[0, 1, 2, 3].map((index) => (
                  <div className='flex-1 overflow-hidden rounded-full bg-neutral-200' key={index}>
                    <div
                      className={`h-full w-full transition-colors ${
                        index < strengthScore ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <p className='mt-1 text-xs text-slate-600'>{strengthLabel}</p>
              {errors.password ? (
                <p className='mt-1 text-sm text-brown-600' id='password-error'>
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-900' htmlFor='confirmPassword'>
                Xác nhận mật khẩu
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500'>
                  <LockIcon />
                </div>
                <input
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className='block w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  id='confirmPassword'
                  name='confirmPassword'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='Nhập lại mật khẩu'
                  type='password'
                  value={values.confirmPassword}
                />
              </div>
              {errors.confirmPassword ? (
                <p className='mt-1 text-sm text-brown-600' id='confirmPassword-error'>
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            <div>
              <label className='flex items-start gap-2 text-sm text-slate-600' htmlFor='terms'>
                <input
                  checked={values.terms}
                  className='mt-0.5 h-4 w-4 rounded border border-neutral-300 bg-neutral-50 accent-blue-500'
                  id='terms'
                  name='terms'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type='checkbox'
                />
                <span>
                  Tôi đồng ý với{' '}
                  <a className='font-medium text-blue-500 underline hover:text-blue-600' href='#'>
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a className='font-medium text-blue-500 underline hover:text-blue-600' href='#'>
                    Chính sách bảo mật
                  </a>
                  .
                </span>
              </label>
              {errors.terms ? <p className='mt-1 text-sm text-brown-600'>{errors.terms}</p> : null}
            </div>

            <div className='pt-1'>
              <SharedButton className='w-full gap-2' disabled={isSubmitting} size='lg' type='submit' variant='primary'>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                <ArrowRightIcon />
              </SharedButton>
            </div>

            {submitError ? <p className='text-center text-sm text-brown-600'>{submitError}</p> : null}
          </form>

          <p className='mt-6 text-center text-sm text-slate-600'>
            Đã có tài khoản?{' '}
            <Link className='font-semibold text-blue-500 underline transition-colors hover:text-blue-600' href='/sign-in'>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}


