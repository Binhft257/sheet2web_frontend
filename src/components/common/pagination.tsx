import type { PaginationMeta } from "@/src/types/pagination";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/src/components/common/icons";

export type PaginationProps = {
  itemLabel: string;
  ariaLabel: string;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => startPage + index);
}

export default function Pagination({
  meta,
  onPageChange,
  itemLabel,
  ariaLabel,
}: PaginationProps) {
  const totalPages = Math.max(meta.totalPages, 1);
  const currentPage = Math.min(Math.max(meta.page, 1), totalPages);
  const startItem = meta.total === 0 ? 0 : (currentPage - 1) * meta.limit + 1;
  const endItem = Math.min(currentPage * meta.limit, meta.total);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="ui-pagination-footer">
      <p>
        Hiển thị{" "}
        <span className="font-medium text-ink">
          {startItem}–{endItem}
        </span>{" "}
        trong tổng số <span className="font-medium text-ink">{meta.total}</span>{" "}
        {itemLabel}
      </p>
      <nav className="ui-pagination" aria-label={ariaLabel}>
        <button
          className="ui-pagination-button"
          aria-label="Trang trước"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
        {visiblePages.map((page) => (
          <button
            className="ui-pagination-button"
            aria-label={`Trang ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}
        <button
          className="ui-pagination-button"
          aria-label="Trang sau"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRightIcon />
        </button>
      </nav>
    </div>
  );
}
