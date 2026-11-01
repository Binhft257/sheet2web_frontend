import type { OwnerView } from "@/src/types/view";

export type ViewSharingTarget = Pick<
  OwnerView,
  "id" | "slug" | "status" | "accessMode"
>;

export type ViewToast = {
  type: "success" | "error";
  message: string;
};
