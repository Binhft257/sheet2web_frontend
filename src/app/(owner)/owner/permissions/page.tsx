import FeaturePlaceholder from "@/src/components/common/feature-placeholder";

export default function Page() {
  return (
    <FeaturePlaceholder
      title="Phân quyền"
      description="Quyền truy cập được quản lý theo từng view. Mở danh sách view để sử dụng các thao tác phân quyền hiện có."
      backHref="/owner/views"
      backLabel="Quản lý view"
    />
  );
}
