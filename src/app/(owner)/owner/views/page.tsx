import ViewList from "@/src/components/owner/views/view-list";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted" role="status">
          Đang tải trang dữ liệu...
        </p>
      }
    >
      <ViewList />
    </Suspense>
  );
}
