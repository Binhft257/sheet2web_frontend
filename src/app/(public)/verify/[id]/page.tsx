import VerifyCodeForm from '@/src/components/auth/verify-code-form';

type VerifyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const verifyId = decodeURIComponent(id);

  return (
    <main className='flex min-h-screen items-center justify-center bg-neutral-50 p-4'>
      <section className='w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-[0_4px_24px_rgba(0,0,0,0.05)] sm:p-8'>
        <h1 className='mb-3 text-2xl font-semibold text-slate-900'>Xác minh tài khoản</h1>
        <p className='text-sm text-slate-600 sm:text-base'>
          Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email để nhập mã xác minh.
        </p>
        <VerifyCodeForm verifyId={verifyId} />
      </section>
    </main>
  );
}
