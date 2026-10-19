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
  },
  {
    key: "totalViews",
    label: "Tổng số view",
    icon: WebIcon,
  },
  {
    key: "publicViews",
    label: "View công khai",
    icon: PublicIcon,
  },
  {
    key: "privateViews",
    label: "View riêng tư",
    icon: PrivateIcon,
  },
];

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

  return (
    <dl className="ui-stats" aria-label="Thống kê nguồn dữ liệu và view" aria-busy={isLoading}>
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            className="ui-stat"
            key={stat.key}
          >
            <dt><span>{stat.label}</span><Icon /></dt>
            <dd>
              {isLoading ? <span className="ui-skeleton h-10 w-16" aria-label="Đang tải" /> : values[stat.key]}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
