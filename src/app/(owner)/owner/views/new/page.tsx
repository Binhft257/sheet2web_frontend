import CreateViewWizard from "@/src/components/owner/views/create-view-wizard";
import { getViewReturnPath } from "@/src/features/owner/views/view-navigation";

type PageProps = {
  searchParams?: Promise<{
    step?: string;
    viewId?: string;
    returnTo?: string;
    completed?: string;
  }>;
};

function normalizeStep(value: string | undefined) {
  if (value === "2") {
    return 2;
  }

  if (value === "3") {
    return 3;
  }

  return 1;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <CreateViewWizard
      initialStep={normalizeStep(params?.step)}
      initialViewId={params?.viewId ?? null}
      returnTo={getViewReturnPath(params?.returnTo)}
      initialCompleted={params?.completed === "1"}
    />
  );
}
