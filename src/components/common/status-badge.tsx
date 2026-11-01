import type { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  showDot?: boolean;
  className?: string;
};

export default function StatusBadge({
  children,
  tone = "neutral",
  showDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={className ? `ui-badge ${className}` : "ui-badge"}
      data-tone={tone}
    >
      {showDot ? <span className="ui-status-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
