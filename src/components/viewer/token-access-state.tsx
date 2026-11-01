import PageState from "@/src/components/common/page-state";
import { WarningIcon } from "@/src/components/common/icons";

export default function TokenAccessState() {
  return (
    <PageState
      fullPage
      title="Truy cập bằng mã truy cập"
      description="Trang truy cập bằng mã hiện chưa có nội dung để hiển thị. Hãy sử dụng liên kết view được chia sẻ với bạn để xem dữ liệu."
      icon={<WarningIcon />}
    />
  );
}
