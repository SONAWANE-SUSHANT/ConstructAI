import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const statusLabel = (value) => value.replaceAll("_", " ");
const typeLabel = (value) => value.replaceAll("_", " ");

const toDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not set");

const rowsFromReports = (reports) => ({
  projectSummary: reports.projectSummary.projects.map((project) => ({
    Name: project.name,
    Client: project.clientName || "",
    Location: project.location || "",
    Status: statusLabel(project.status),
    Budget: project.budget || 0,
    Documents: project.documentCount,
    Start: toDate(project.startDate),
    End: toDate(project.endDate),
  })),
  budgetReport: reports.budgetReport.byStatus.map((item) => ({
    Status: statusLabel(item.status),
    Budget: item.budget,
  })),
  documentReport: reports.documentReport.documents.map((document) => ({
    Title: document.title,
    Type: typeLabel(document.type),
    Project: document.projectName,
    File: document.originalName,
    Size: document.size,
    Uploaded: toDate(document.createdAt),
  })),
  timelineReport: reports.timelineReport.map((project) => ({
    Project: project.name,
    Status: statusLabel(project.status),
    Start: toDate(project.startDate),
    End: toDate(project.endDate),
  })),
});

const downloadBlob = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export const exportReportsCsv = (reports) => {
  const rows = rowsFromReports(reports);
  const content = Object.entries(rows)
    .map(([title, sectionRows]) => {
      if (sectionRows.length === 0) return `${title}\nNo data`;
      const headers = Object.keys(sectionRows[0]);
      return [title, headers.join(","), ...sectionRows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
    })
    .join("\n\n");

  downloadBlob(content, "text/csv;charset=utf-8", "constructai-reports.csv");
};

export const exportReportsExcel = (reports) => {
  const workbook = XLSX.utils.book_new();
  const rows = rowsFromReports(reports);

  Object.entries(rows).forEach(([title, sectionRows]) => {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sectionRows.length ? sectionRows : [{ Message: "No data" }]), title.slice(0, 31));
  });

  XLSX.writeFile(workbook, "constructai-reports.xlsx");
};

export const exportReportsPdf = (reports) => {
  const pdf = new jsPDF();
  const rows = rowsFromReports(reports);
  let y = 18;

  pdf.setFontSize(16);
  pdf.text("ConstructAI Reports", 14, y);
  y += 10;

  Object.entries(rows).forEach(([title, sectionRows]) => {
    if (y > 250) {
      pdf.addPage();
      y = 18;
    }

    pdf.setFontSize(12);
    pdf.text(title, 14, y);
    y += 4;

    const headers = sectionRows.length ? Object.keys(sectionRows[0]) : ["Message"];
    const body = sectionRows.length ? sectionRows.map((row) => headers.map((header) => row[header])) : [["No data"]];
    autoTable(pdf, { head: [headers], body, startY: y, styles: { fontSize: 8 } });
    y = pdf.lastAutoTable.finalY + 10;
  });

  pdf.save("constructai-reports.pdf");
};
