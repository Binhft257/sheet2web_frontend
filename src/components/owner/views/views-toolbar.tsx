import type { ChangeEventHandler } from "react";
import { SearchIcon } from "@/src/components/common/icons";
import type { ViewAccessModeFilter, ViewStatusFilter } from "@/src/types/view";

type ViewsToolbarProps = {
  search: string;
  statusFilter: ViewStatusFilter | "";
  accessModeFilter: ViewAccessModeFilter | "";
  onSearchChange: ChangeEventHandler<HTMLInputElement>;
  onStatusChange: ChangeEventHandler<HTMLSelectElement>;
  onAccessModeChange: ChangeEventHandler<HTMLSelectElement>;
};

export default function ViewsToolbar(props: ViewsToolbarProps) {
  return (
    <div className="ui-views-toolbar">
      <div className="min-w-0">
        <label className="ui-field-label" htmlFor="views-search">
          Tìm view
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
          <input
            className="ui-form-control pl-11"
            id="views-search"
            onChange={props.onSearchChange}
            placeholder="Tìm theo tên view…"
            type="search"
            value={props.search}
          />
        </div>
      </div>
      <div>
        <label className="ui-field-label" htmlFor="views-status">
          Trạng thái
        </label>
        <select
          className="ui-form-control"
          id="views-status"
          onChange={props.onStatusChange}
          value={props.statusFilter}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="published">Đã xuất bản</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
      </div>
      <div>
        <label className="ui-field-label" htmlFor="views-access">
          Quyền truy cập
        </label>
        <select
          className="ui-form-control"
          id="views-access"
          onChange={props.onAccessModeChange}
          value={props.accessModeFilter}
        >
          <option value="">Tất cả quyền truy cập</option>
          <option value="public">Công khai</option>
          <option value="private">Riêng tư</option>
        </select>
      </div>
    </div>
  );
}
