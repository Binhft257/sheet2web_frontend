import type { ThemePreset } from "@/src/types/view";
import styles from "./published-view.module.css";

type ViewerTableProps = {
  headers: string[];
  rows: string[][];
  themePreset: ThemePreset;
  tableMaxHeightClassName?: string;
  caption?: string;
};

type ViewerThemeClasses = {
  wrapper: string;
  table: string;
  header: string;
  headerCell: string;
  row: string;
  cell: string;
};

const themeClasses: Record<ThemePreset, ViewerThemeClasses> = {
  modern: {
    wrapper:
      "border-blue-100 bg-white shadow-[0_18px_60px_rgba(30,58,138,0.10)]",
    table: "border-separate border-spacing-0",
    header: "sticky top-0 z-10 bg-blue-50",
    headerCell:
      "border-b border-blue-100 px-5 py-4 text-sm font-bold text-blue-950",
    row: "transition-colors hover:bg-blue-50/50",
    cell: "border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-700",
  },
  classic: {
    wrapper:
      "border-slate-300 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]",
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-slate-200",
    headerCell:
      "border border-slate-300 px-5 py-4 text-sm font-bold text-slate-900",
    row: "",
    cell: "border border-slate-300 px-5 py-4 text-sm font-medium text-slate-800",
  },
  minimal: {
    wrapper:
      "border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-white",
    headerCell:
      "border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-900",
    row: "transition-colors hover:bg-slate-50",
    cell: "border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-700",
  },
};

export default function ViewerTable({
  headers,
  rows,
  themePreset,
  tableMaxHeightClassName = "max-h-[calc(100vh-220px)]",
  caption = "Dữ liệu được chia sẻ",
}: ViewerTableProps) {
  const columnCount = Math.max(
    headers.length,
    ...rows.map((row) => row.length),
    0,
  );
  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) => {
    const header = headers[index]?.trim();
    return header ?? "";
  });
  const theme = themeClasses[themePreset];

  return (
    <div
      className={`overflow-hidden border ${styles.tablePanel} ${theme.wrapper}`}
      data-theme={themePreset}
    >
      <div
        className={`${styles.tableViewport} ${tableMaxHeightClassName} overflow-auto`}
        role="region"
        tabIndex={0}
        aria-label="Bảng dữ liệu, có thể cuộn ngang và dọc"
      >
        <table
          className={`w-full text-left ${theme.table}`}
          style={{
            minWidth: `${Math.max(760, normalizedHeaders.length * 180)}px`,
          }}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className={theme.header}>
            <tr>
              {normalizedHeaders.map((header, index) => (
                <th
                  className={theme.headerCell}
                  scope="col"
                  aria-label={header ? undefined : `Cột ${index + 1}`}
                  key={`${header}-${index}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className={theme.row} key={`viewer-row-${rowIndex}`}>
                {normalizedHeaders.map((_, cellIndex) => (
                  <td
                    className={`max-w-[320px] whitespace-pre-wrap break-words ${theme.cell}`}
                    key={`viewer-cell-${rowIndex}-${cellIndex}`}
                  >
                    {row[cellIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.tableHint}>
        Cuộn ngang trong bảng để xem đầy đủ các cột.
      </p>
    </div>
  );
}
