import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProject, statusLabels } from "../../api/projects";

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setApiError("");

      try {
        const nextProject = await getProject(id);
        setProject(nextProject);
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load this project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this project? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    setApiError("");

    try {
      await deleteProject(id);
      navigate("/projects");
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to delete this project.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <section className="mx-auto w-full max-w-5xl rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          Loading project...
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <section className="mx-auto w-full max-w-5xl rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-red-700">{apiError || "Project not found."}</p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-800" to="/projects">
            Back to projects
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Project details</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-3xl font-bold text-slate-950">{project.name}</h1>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClassNames[project.status]}`}>
                {statusLabels[project.status]}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white"
              to="/projects"
            >
              All projects
            </Link>
            <Link
              className="rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-800"
              to={`/projects/${project.id}/edit`}
            >
              Edit
            </Link>
          </div>
        </div>

        {apiError ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Overview</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
              {project.description || "No project description has been added."}
            </p>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Client</dt>
                <dd className="mt-1 font-semibold text-slate-900">{project.clientName || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Location</dt>
                <dd className="mt-1 font-semibold text-slate-900">{project.location || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Start date</dt>
                <dd className="mt-1 font-semibold text-slate-900">{formatDate(project.startDate)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">End date</dt>
                <dd className="mt-1 font-semibold text-slate-900">{formatDate(project.endDate)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Budget</dt>
                <dd className="mt-1 font-semibold text-slate-900">{formatCurrency(project.budget)}</dd>
              </div>
            </dl>
          </article>

          <aside className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Record</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="mt-1 font-medium text-slate-800">{formatDateTime(project.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Last updated</dt>
                <dd className="mt-1 font-medium text-slate-800">{formatDateTime(project.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Project ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">{project.id}</dd>
              </div>
            </dl>

            <button
              className="mt-6 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete project"}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
