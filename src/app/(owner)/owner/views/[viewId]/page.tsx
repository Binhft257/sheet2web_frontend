import FeaturePlaceholder from "@/src/components/common/feature-placeholder";

export default function Page() {
  return (
    <FeaturePlaceholder
      title="Chi tiết view"
      description="Bạn có thể xem thông tin chi tiết của từng view trong danh sách quản lý view."
      backHref="/owner/views"
      backLabel="Quản lý view"
    />
  );
}
