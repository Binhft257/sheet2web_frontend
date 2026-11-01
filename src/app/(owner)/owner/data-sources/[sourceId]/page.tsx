import FeaturePlaceholder from "@/src/components/common/feature-placeholder";

export default function Page() {
  return (
    <FeaturePlaceholder
      title="Chi tiết nguồn dữ liệu"
      description="Trang này chưa có thông tin chi tiết nguồn dữ liệu. Bạn có thể xem các nguồn từ danh sách."
      backHref="/owner/data-sources"
      backLabel="Mở nguồn dữ liệu"
    />
  );
}
