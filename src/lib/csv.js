export function downloadCsv(filename, rows) {
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/"/g, '""');
    return /[",\n\r;]/.test(text) ? `"${text}"` : text;
  };

  const csv = "\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function todaySlug() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
