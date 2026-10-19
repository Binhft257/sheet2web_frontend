import type { SVGProps } from "react";

export default function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 36 36" {...props}>
      <rect width="36" height="36" rx="10" fill="currentColor" />
      <path d="M10 10h9v16h-9z" fill="white" fillOpacity=".24" />
      <path
        d="M10 10h16v16H10zM10 15.5h16M15.5 10v16"
        stroke="white" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="m21 20 3 3-3 3m-3-3h6" stroke="white" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
