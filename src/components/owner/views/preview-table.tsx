import type { DataSourcePreview } from "@/src/types/data-source";
import type { ThemePreset } from "@/src/types/view";

type PreviewTableProps = {
  preview: DataSourcePreview | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  themePreset?: ThemePreset;
};

type PreviewThemeClasses = {
  table: string;
  header: string;
  headerCell: string;
  row: string;
  cell: string;
};

const themeClasses: Record<ThemePreset, PreviewThemeClasses> = {
  modern: {
    table: "border-separate border-spacing-0",
    header: "sticky top-0 z-10 bg-blue-50",
    headerCell: "border-b border-blue-100 px-4 py-3 text-sm font-bold text-blue-950",
    row: "transition-colors hover:bg-blue-50/40",
    cell: "border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700",
  },
  classic: {
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-slate-200",
    headerCell: "border border-slate-300 px-4 py-3 text-sm font-bold text-slate-900",
    row: "",
    cell: "border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800",
  },
  minimal: {
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-white",
    headerCell: "border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-900",
    row: "transition-colors hover:bg-slate-50",
    cell: "border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700",
  },
};

function LoadingTable() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-56 animate-pulse rounded-md bg-slate-100" />
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="grid grid-cols-4 gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
            key={`preview-loading-${index}`}
          >
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <div
                className="h-5 animate-pulse rounded bg-slate-100"
                key={`preview-loading-${index}-${cellIndex}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreviewTable({
  preview,
  isLoading = false,
  errorMessage = null,
  themePreset = "modern",
}: PreviewTableProps) {
  if (isLoading) {
    return <LoadingTable />;
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-bold text-red-700">
          Không thể preview dữ liệu
        </p>
        <p className="mt-1 text-sm font-medium text-red-600">{errorMessage}</p>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-base font-bold text-slate-900">
          Chưa có dữ liệu preview
        </p>
        <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
          Chọn sheet và nhấn Preview để kiểm tra dữ liệu trước khi tạo view.
        </p>
      </div>
    );
  }

  const columnCount = Math.max(
    preview.headers.length,
    ...preview.rows.map((row) => row.length),
    0,
  );
  const headers = Array.from({ length: columnCount }, (_, index) => {
    const header = preview.headers[index]?.trim();
    return header ?? "";
  });
  const theme = themeClasses[themePreset];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {preview.sheetName}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {preview.rowCount} dòng được trả về
            {preview.rangeA1Notation ? ` từ ${preview.rangeA1Notation}` : ""}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[520px] overflow-auto">
          <table
            className={`w-full text-left ${theme.table}`}
            style={{ minWidth: `${Math.max(720, headers.length * 180)}px` }}
          >
            <thead className={theme.header}>
              <tr>
                {headers.map((header, index) => (
                  <th className={theme.headerCell} key={`${header}-${index}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, rowIndex) => (
                <tr className={theme.row} key={`preview-row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td
                      className={`max-w-[260px] truncate ${theme.cell}`}
                      key={`preview-cell-${rowIndex}-${cellIndex}`}
                      title={row[cellIndex] ?? ""}
                    >
                      {row[cellIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
