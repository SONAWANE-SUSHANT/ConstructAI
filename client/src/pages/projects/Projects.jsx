import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, projectStatuses, statusLabels } from "../../api/projects";

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "Not set";
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
};

const statusClassNames = {
  PLANNING: "bg-sky-50 text-sky-700 ring-sky-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ON_HOLD: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setApiError("");

      try {
        const data = await getProjects({ search, status, page, limit: pagination.limit });
        setProjects(data.projects);
        setPagination(data.pagination);
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [page, pagination.limit, search, status]);

  const hasFilters = useMemo(() => Boolean(search || status), [search, status]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (event) => {
    setPage(1);
    setStatus(event.target.value);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">ConstructAi</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Projects</h1>
            <p className="mt-2 text-sm text-slate-600">Track construction work from planning through completion.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white"
              to="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-800"
              to="/projects/new"
            >
              New project
            </Link>
          </div>
        </div>

        <div className="mb-5 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]" onSubmit={handleSearch}>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, client, location, or notes"
            />
            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">All statuses</option>
              {projectStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              type="submit"
            >
              Search
            </button>
            <button
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              Clear
            </button>
          </form>
        </div>

        {apiError ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">{hasFilters ? "No projects found" : "No projects yet"}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {hasFilters ? "Adjust your search or filters to find a project." : "Create your first project to start tracking site work."}
            </p>
            <Link
              className="mt-5 inline-flex rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
              to="/projects/new"
            >
              New project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-950">{project.name}</h2>
                    <p className="mt-1 truncate text-sm text-slate-600">{project.clientName || "No client assigned"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClassNames[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Location</dt>
                    <dd className="mt-1 truncate font-medium text-slate-800">{project.location || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Budget</dt>
                    <dd className="mt-1 font-medium text-slate-800">{formatCurrency(project.budget)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Start</dt>
                    <dd className="mt-1 font-medium text-slate-800">{formatDate(project.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">End</dt>
                    <dd className="mt-1 font-medium text-slate-800">{formatDate(project.endDate)}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex gap-3">
                  <Link
                    className="flex-1 rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-800"
                    to={`/projects/${project.id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    to={`/projects/${project.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && pagination.total > 0 ? (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 sm:flex-row">
            <span>
              Page {pagination.page} of {pagination.totalPages} - {pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
