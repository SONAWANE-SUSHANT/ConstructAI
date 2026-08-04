import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/analytics";
import DataTable from "../../components/DataTable";
import PageShell from "../../components/PageShell";
import StatCard from "../../components/StatCard";
import { documentTypeLabels } from "../../api/documents";
import { statusLabels } from "../../api/projects";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not set");

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setApiError("");

      try {
        setDashboard(await getDashboardStats());
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statusChart = useMemo(() => {
    const items = dashboard?.charts.projectStatus || [];
    return {
      labels: items.map((item) => statusLabels[item.status]),
      datasets: [
        {
          data: items.map((item) => item.count),
          backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#64748b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboard]);

  const budgetChart = useMemo(() => {
    const items = dashboard?.charts.budgetDistribution || [];
    return {
      labels: items.map((item) => item.name),
      datasets: [
        {
          label: "Budget",
          data: items.map((item) => item.budget),
          backgroundColor: "#0e7490",
          borderRadius: 6,
        },
      ],
    };
  }, [dashboard]);

  const projectColumns = [
    { key: "name", header: "Project", render: (row) => <Link className="font-semibold text-cyan-700" to={`/projects/${row.id}`}>{row.name}</Link> },
    { key: "status", header: "Status", render: (row) => statusLabels[row.status] },
    { key: "budget", header: "Budget", render: (row) => formatCurrency(row.budget) },
    { key: "documentCount", header: "Docs" },
    { key: "updatedAt", header: "Updated", render: (row) => formatDate(row.updatedAt) },
  ];

  const documentColumns = [
    { key: "title", header: "Document" },
    { key: "type", header: "Type", render: (row) => documentTypeLabels[row.type] },
    { key: "projectName", header: "Project" },
    { key: "createdAt", header: "Uploaded", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <PageShell
      eyebrow="ConstructAi"
      title="Dashboard"
      description="Project, budget, and document activity across your workspace."
      action={<Link className="rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-800" to="/projects/new">New project</Link>}
    >
      {apiError ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div> : null}
      {loading || !dashboard ? (
        <div className="rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">Loading dashboard...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total Projects" value={dashboard.summary.totalProjects} />
            <StatCard label="Active Projects" value={dashboard.summary.activeProjects} />
            <StatCard label="Completed Projects" value={dashboard.summary.completedProjects} />
            <StatCard label="Total Budget" value={formatCurrency(dashboard.summary.totalBudget)} />
            <StatCard label="Total Documents" value={dashboard.summary.totalDocuments} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-950">Project Status</h2>
              <div className="mt-4 h-72">
                <Doughnut data={statusChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
              </div>
            </section>
            <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-950">Budget Distribution</h2>
              <div className="mt-4 h-72">
                <Bar data={budgetChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              </div>
            </section>
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Recent Projects</h2>
            <DataTable columns={projectColumns} rows={dashboard.recentProjects} emptyMessage="No projects yet." />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Recent Documents</h2>
            <DataTable columns={documentColumns} rows={dashboard.recentDocuments} emptyMessage="No documents yet." />
          </section>
        </div>
      )}
    </PageShell>
  );
}
