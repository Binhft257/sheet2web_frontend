import Pagination, {
  type PaginationProps,
} from "@/src/components/common/pagination";
export default function DataSourcesPagination(
  props: Pick<PaginationProps, "meta" | "onPageChange">,
) {
  return (
    <Pagination
      {...props}
      itemLabel="nguồn"
      ariaLabel="Phân trang nguồn dữ liệu"
    />
  );
}
