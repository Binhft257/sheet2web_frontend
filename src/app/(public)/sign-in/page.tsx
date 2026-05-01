import SignInForm from '@/src/components/auth/sign-in-form';

type SignInPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { registered } = await searchParams;
  return <SignInForm showRegisteredSuccess={registered === '1'} />;
}
