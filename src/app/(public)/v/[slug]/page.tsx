import PublishedViewPage from "@/src/components/viewer/published-view-page";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    shareToken?: string;
  }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  return <PublishedViewPage shareToken={query?.shareToken} slug={slug} />;
}
