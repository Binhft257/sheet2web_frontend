'use client';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div>
      <h1>Đã xảy ra lỗi</h1>
      <p>{error.message}</p>
      <button type='button' onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
