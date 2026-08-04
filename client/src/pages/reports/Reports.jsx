import { useEffect, useState } from "react";
import { documentTypes } from "../../api/documents";
import { getReports } from "../../api/analytics";
import { projectStatuses, statusLabels } from "../../api/projects";
import DataTable from "../../components/DataTable";
import PageShell from "../../components/PageShell";
import StatCard from "../../components/StatCard";
import { exportReportsCsv, exportReportsExcel, exportReportsPdf } from "../../utils/exportReports";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not set");

const formatSize = (value) => {
  if (!value) return "0 KB";
  return `${Math.max(value / 1024, 1).toFixed(1)} KB`;
};

export default function Reports() {
  const [filters, setFilters] = useState({ status: "", documentType: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setApiError("");

      try {
        setReports(await getReports(appliedFilters));
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [appliedFilters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const empty = { status: "", documentType: "", from: "", to: "" };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const projectColumns = [
    { key: "name", header: "Project" },
    { key: "clientName", header: "Client", render: (row) => row.clientName || "" },
    { key: "status", header: "Status", render: (row) => statusLabels[row.status] },
    { key: "budget", header: "Budget", render: (row) => formatCurrency(row.budget) },
    { key: "documentCount", header: "Docs" },
  ];

  const documentColumns = [
    { key: "title", header: "Document" },
    { key: "type", header: "Type", render: (row) => row.type.replaceAll("_", " ") },
    { key: "projectName", header: "Project" },
    { key: "size", header: "Size", render: (row) => formatSize(row.size) },
    { key: "createdAt", header: "Uploaded", render: (row) => formatDate(row.createdAt) },
  ];

  const timelineColumns = [
    { key: "name", header: "Project" },
    { key: "status", header: "Status", render: (row) => statusLabels[row.status] },
    { key: "startDate", header: "Start", render: (row) => formatDate(row.startDate) },
    { key: "endDate", header: "End", render: (row) => formatDate(row.endDate) },
  ];

  return (
    <PageShell eyebrow="Reports" title="Reports" description="Filter, review, and export project, budget, document, and timeline data.">
      <form className="mb-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]" onSubmit={handleSubmit}>
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="status" value={filters.status} onChange={handleChange}>
          <option value="">All statuses</option>
          {projectStatuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="documentType" value={filters.documentType} onChange={handleChange}>
          <option value="">All document types</option>
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" type="date" name="from" value={filters.from} onChange={handleChange} />
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" type="date" name="to" value={filters.to} onChange={handleChange} />
        <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Apply</button>
        <button className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={clearFilters}>Clear</button>
      </form>

      {apiError ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div> : null}
      {loading || !reports ? (
        <div className="rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">Loading reports...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800" type="button" onClick={() => exportReportsPdf(reports)}>PDF</button>
            <button className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800" type="button" onClick={() => exportReportsExcel(reports)}>Excel</button>
            <button className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800" type="button" onClick={() => exportReportsCsv(reports)}>CSV</button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Projects" value={reports.projectSummary.total} />
            <StatCard label="Total Budget" value={formatCurrency(reports.budgetReport.totalBudget)} />
            <StatCard label="Documents" value={reports.documentReport.total} />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Project Summary</h2>
            <DataTable columns={projectColumns} rows={reports.projectSummary.projects} emptyMessage="No projects match these filters." />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-950">Budget Report</h2>
              <DataTable
                columns={[
                  { key: "status", header: "Status", render: (row) => statusLabels[row.status] },
                  { key: "budget", header: "Budget", render: (row) => formatCurrency(row.budget) },
                ]}
                rows={reports.budgetReport.byStatus.map((row) => ({ ...row, id: row.status }))}
                emptyMessage="No budget data."
              />
            </div>
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-950">Document Report</h2>
              <DataTable columns={documentColumns} rows={reports.documentReport.documents} emptyMessage="No documents match these filters." />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Timeline Report</h2>
            <DataTable columns={timelineColumns} rows={reports.timelineReport} emptyMessage="No timeline data." />
          </section>
        </div>
      )}
    </PageShell>
  );
}
