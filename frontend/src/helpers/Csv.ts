export function csvEscape(value: any): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    value = JSON.stringify(value);
  }

  let s = String(value);

  const mustQuote = /[",\n\r]/.test(s);
  if (mustQuote) {
    s = s.replace(/"/g, '""'); // CSV escaping for quotes
    return `"${s}"`;
  }
  return s;
}

export function buildCsv(headers: string[], rows: Record<string, any>[]): string {
  const headerLine = headers.map(csvEscape).join(",");
  const lines = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","));
  return [headerLine, ...lines].join("\n");
}
