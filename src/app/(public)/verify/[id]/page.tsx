import VerifyCodeForm from "@/src/components/auth/verify-code-form";
import AuthShell from "@/src/components/auth/auth-shell";

type VerifyPageProps = { params: Promise<{ id: string }> };

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;
  const verifyId = decodeURIComponent(id);
  return (
    <AuthShell
      title="Xác minh tài khoản"
      description="Tài khoản của bạn chưa được xác minh. Vui lòng kiểm tra email để nhập mã xác minh."
    >
      <VerifyCodeForm verifyId={verifyId} />
    </AuthShell>
  );
}
