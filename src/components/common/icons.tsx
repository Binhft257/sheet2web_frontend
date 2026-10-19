import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame(props: IconProps) {
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
    />
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconFrame>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m18 6-12 12M6 6l12 12" />
    </IconFrame>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconFrame>
  );
}

export function SheetIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect height="16" rx="2" width="14" x="5" y="4" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </IconFrame>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m15 18-6-6 6-6" />
    </IconFrame>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconFrame>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconFrame>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m10.3 4-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </IconFrame>
  );
}
