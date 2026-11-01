import AppLink from "@/src/components/app-link";
import PageState from "@/src/components/common/page-state";
import { WarningIcon } from "@/src/components/common/icons";

export default function Page() {
  return (
    <PageState
      title="Trang không khả dụng"
      description="Hiện không thể hiển thị nội dung tại đường dẫn này."
      icon={<WarningIcon />}
      actions={
        <AppLink
          className="ui-button"
          data-variant="outlined"
          href="/viewer/dashboard"
        >
          Về tổng quan
        </AppLink>
      }
    />
  );
}
