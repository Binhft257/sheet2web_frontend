import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { APP_PREFIX, appPath } from "@/src/lib/app-path";

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function AppLink({ href, ...props }: AppLinkProps) {
  const url = appPath(href);

  if (APP_PREFIX) {
    return <a href={url} {...props} />;
  }

  return <Link href={url} {...props} />;
}
