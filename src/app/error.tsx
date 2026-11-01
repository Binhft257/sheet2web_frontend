"use client";

import PageState from "@/src/components/common/page-state";
import { WarningIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div role="alert">
      <PageState
        fullPage
        title="Đã xảy ra lỗi"
        description={error.message}
        icon={<WarningIcon />}
        actions={<SharedButton onClick={reset}>Thử lại</SharedButton>}
      />
    </div>
  );
}
