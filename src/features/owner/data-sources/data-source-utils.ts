import type { DataSource } from "@/src/types/data-source";

export function getDataSourceUrl(
  dataSource?: Pick<DataSource, "sourceUrl" | "spreadsheetId"> | null,
) {
  const sourceUrl = dataSource?.sourceUrl?.trim();
  if (sourceUrl) return sourceUrl;

  const spreadsheetId = dataSource?.spreadsheetId?.trim();
  return spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : "";
}
