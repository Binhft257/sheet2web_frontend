import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  showDot?: boolean;
};

export default function StatusBadge({ children, tone = "neutral", showDot = true }: StatusBadgeProps) {
  return (
    <span className="ui-badge" data-tone={tone}>
      {showDot ? <span className="ui-status-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
