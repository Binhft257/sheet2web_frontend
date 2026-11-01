import AppLink from "@/src/components/app-link";
import PageState from "@/src/components/common/page-state";
import { WarningIcon } from "@/src/components/common/icons";

export default function Page() {
  return (
    <PageState
      title="Không có quyền truy cập"
      description="Bạn chưa được cấp quyền xem nội dung này. Hãy liên hệ người chia sẻ để kiểm tra quyền truy cập."
      icon={<WarningIcon />}
      actions={
        <AppLink className="ui-button" href="/viewer/shared">
          View được chia sẻ với tôi
        </AppLink>
      }
    />
  );
}
