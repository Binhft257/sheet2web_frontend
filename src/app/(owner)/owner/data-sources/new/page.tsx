import FeaturePlaceholder from "@/src/components/common/feature-placeholder";

export default function Page() {
  return (
    <FeaturePlaceholder
      title="Tạo nguồn dữ liệu mới"
      description="Bạn có thể thêm nguồn dữ liệu từ danh sách nguồn trong không gian quản lý."
      backHref="/owner/data-sources"
      backLabel="Mở nguồn dữ liệu"
    />
  );
}
