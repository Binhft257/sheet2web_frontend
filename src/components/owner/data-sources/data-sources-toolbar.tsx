import { SearchIcon } from "@/src/components/common/icons";
import { DATA_SOURCE_STATUS_OPTIONS } from "@/src/components/owner/data-sources/data-source-presentation";
import type { DataSourceStatusFilter } from "@/src/types/data-source";

type DataSourcesToolbarProps = {
  search: string;
  statusFilter: DataSourceStatusFilter | "";
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: DataSourceStatusFilter | "") => void;
};

export default function DataSourcesToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: DataSourcesToolbarProps) {
  return (
    <div className="ui-sources-toolbar">
      <div className="min-w-0 flex-1">
        <label className="ui-field-label" htmlFor="source-search">
          Tìm nguồn dữ liệu
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input
            className="ui-form-control pl-11"
            id="source-search"
            type="search"
            placeholder="Tìm theo tên nguồn…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <div className="w-full sm:w-52">
        <label className="ui-field-label" htmlFor="source-status-filter">
          Trạng thái kết nối
        </label>
        <select
          className="ui-form-control"
          id="source-status-filter"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(
              event.target.value as DataSourceStatusFilter | "",
            )
          }
        >
          <option value="">Tất cả trạng thái</option>
          {DATA_SOURCE_STATUS_OPTIONS.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
