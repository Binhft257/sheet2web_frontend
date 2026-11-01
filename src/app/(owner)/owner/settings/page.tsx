import FeaturePlaceholder from "@/src/components/common/feature-placeholder";

export default function Page() {
  return (
    <FeaturePlaceholder
      title="Cài đặt"
      description="Chưa có tùy chọn cài đặt để hiển thị tại đây."
      backHref="/owner/dashboard"
      backLabel="Về tổng quan"
    />
  );
}
