import type { Metadata } from "next";
import WorkspacePicker from "@/src/components/workspace/workspace-picker";

export const metadata: Metadata = {
  title: "Chọn Không gian làm việc - Sheet-to-Web",
  description: "Chọn không gian làm việc để tiếp tục sử dụng Sheet2Web.",
};

export default function Page() {
  return <WorkspacePicker />;
}
