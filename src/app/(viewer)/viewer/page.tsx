import { redirect } from "next/navigation";
import { appPath } from "@/src/lib/app-path";

export default function Page() {
  redirect(appPath("/viewer/dashboard"));
}
