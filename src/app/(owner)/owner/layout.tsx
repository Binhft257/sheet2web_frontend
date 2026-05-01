import OwnerShell from "@/src/components/owner/layouts/owner-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}
