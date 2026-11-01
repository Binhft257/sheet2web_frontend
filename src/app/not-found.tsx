import AppLink from "@/src/components/app-link";
import PageState from "@/src/components/common/page-state";
import { WarningIcon } from "@/src/components/common/icons";

export default function NotFound() {
  return (
    <PageState
      fullPage
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn này không tồn tại hoặc đã được thay đổi."
      icon={<WarningIcon />}
      actions={
        <AppLink className="ui-button" href="/">
          Về không gian làm việc
        </AppLink>
      }
    />
  );
}
