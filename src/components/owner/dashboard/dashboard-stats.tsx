import type { ReactElement, SVGProps } from "react";

type DashboardStatsProps = {
  totalDataSources: number;
  totalViews: number;
  publicViews: number;
  privateViews: number;
  isLoading?: boolean;
};

type StatConfig = {
  key: "totalDataSources" | "totalViews" | "publicViews" | "privateViews";
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  iconContainerClassName: string;
  iconClassName: string;
};

function DatabaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="8.5" ry="3.5" />
      <path d="M3.5 5v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5V5" />
      <path d="M3.5 11v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5v-6" />
    </svg>
  );
}

function WebIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 2.4 4.5 5.7 4.5 9s-1.7 6.6-4.5 9c-2.8-2.4-4.5-5.7-4.5-9S9.2 5.4 12 3Z" />
    </svg>
  );
}

function PublicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M14 10a5 5 0 1 0-4 0M5.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="19" cy="6.5" r="3.5" />
    </svg>
  );
}

function PrivateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="10" rx="2" width="14" x="5" y="11" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

const statsConfig: StatConfig[] = [
  {
    key: "totalDataSources",
    label: "Tổng nguồn dữ liệu",
    icon: DatabaseIcon,
    iconContainerClassName: "bg-blue-50",
    iconClassName: "text-blue-700",
  },
  {
    key: "totalViews",
    label: "Tổng số view",
    icon: WebIcon,
    iconContainerClassName: "bg-indigo-50",
    iconClassName: "text-indigo-700",
  },
  {
    key: "publicViews",
    label: "View công khai",
    icon: PublicIcon,
    iconContainerClassName: "bg-emerald-50",
    iconClassName: "text-emerald-700",
  },
  {
    key: "privateViews",
    label: "View riêng tư",
    icon: PrivateIcon,
    iconContainerClassName: "bg-amber-50",
    iconClassName: "text-amber-700",
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="mb-6 h-12 w-12 animate-pulse rounded-md bg-slate-200" />
      <div className="space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function DashboardStats({
  totalDataSources,
  totalViews,
  publicViews,
  privateViews,
  isLoading = false,
}: DashboardStatsProps) {
  const values = {
    totalDataSources,
    totalViews,
    publicViews,
    privateViews,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((stat) => (
          <SkeletonCard key={stat.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
            key={stat.key}
          >
            <div
              className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md ${stat.iconContainerClassName}`}
            >
              <Icon className={`h-6 w-6 ${stat.iconClassName}`} />
            </div>

            <p className="mb-2 text-sm font-bold text-slate-500">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-slate-900">
              {values[stat.key]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
