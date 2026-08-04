import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteDocument,
  documentTypeLabels,
  documentTypes,
  downloadDocument,
  getProjectDocuments,
  openDocument,
  uploadProjectDocument,
} from "../../api/documents";
import { deleteProject, getProject, statusLabels } from "../../api/projects";
import ProjectResourcesPanel from "../../components/ProjectResourcesPanel";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../hooks/useToast";

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
  const { notify } = useToast();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentForm, setDocumentForm] = useState({ title: "", type: "BOQ", file: null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [documentActionId, setDocumentActionId] = useState("");
  const [activeTab, setActiveTab] = useState("documents");
  const [confirm, setConfirm] = useState(null);
  const [apiError, setApiError] = useState("");
  const [documentError, setDocumentError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setApiError("");

      try {
        const [nextProject, nextDocuments] = await Promise.all([getProject(id), getProjectDocuments(id)]);
        setProject(nextProject);
        setDocuments(nextDocuments);
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load this project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setApiError("");

    try {
      await deleteProject(id);
      notify("Project deleted.", "success");
      navigate("/projects");
    } catch (error) {
      const message = error.userMessage || "Unable to delete this project.";
      setApiError(message);
      notify(message, "error");
      setDeleting(false);
    }
  };

  const handleDocumentChange = (event) => {
    const { name, value, files } = event.target;
    setDocumentForm((current) => ({ ...current, [name]: files ? files[0] : value }));
    setDocumentError("");
  };

  const handleDocumentUpload = async (event) => {
    event.preventDefault();

    if (!documentForm.file) {
      setDocumentError("Choose a file to upload.");
      return;
    }

    setUploading(true);
    setDocumentError("");

    try {
      const document = await uploadProjectDocument(id, documentForm);
      setDocuments((current) => [document, ...current]);
      setDocumentForm({ title: "", type: "BOQ", file: null });
      event.target.reset();
    } catch (error) {
      setDocumentError(error.response?.data?.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    setDocumentActionId(documentId);
    setDocumentError("");

    try {
      await deleteDocument(documentId);
      setDocuments((current) => current.filter((document) => document.id !== documentId));
      notify("Document deleted.", "success");
    } catch (error) {
      const message = error.userMessage || "Unable to delete document.";
      setDocumentError(message);
      notify(message, "error");
    } finally {
      setDocumentActionId("");
    }
  };

  const handleDocumentOpen = async (document, action) => {
    setDocumentActionId(document.id);
    setDocumentError("");

    try {
      await action(document);
    } catch (error) {
      const message = error.userMessage || "Unable to open document.";
      setDocumentError(message);
      notify(message, "error");
    } finally {
      setDocumentActionId("");
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
              onClick={() => setConfirm({ title: "Delete project", message: "Delete this project? This action cannot be undone.", onConfirm: handleDelete })}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete project"}
            </button>
          </aside>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200">
          {["documents", "resources"].map((tab) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${activeTab === tab ? "bg-cyan-700 text-white" : "text-slate-700 hover:bg-slate-50"}`}
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "resources" ? <ProjectResourcesPanel projectId={project.id} /> : (
        <section className="mt-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Documents</h2>
              <p className="mt-1 text-sm text-slate-600">Upload BOQs, blueprints, contracts, price lists, and quotations.</p>
            </div>
          </div>

          <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_1fr_auto]" onSubmit={handleDocumentUpload}>
            <input
              className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="title"
              value={documentForm.title}
              onChange={handleDocumentChange}
              placeholder="Document title"
            />
            <select
              className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="type"
              value={documentForm.type}
              onChange={handleDocumentChange}
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-950 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              type="file"
              name="file"
              onChange={handleDocumentChange}
            />
            <button
              className="rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-400"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {documentError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {documentError}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            {documents.length === 0 ? (
              <p className="px-4 py-5 text-sm text-slate-600">No documents uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {documents.map((document) => (
                  <div key={document.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_180px_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{document.title}</p>
                      <p className="mt-1 truncate text-sm text-slate-600">{document.originalName}</p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {documentTypeLabels[document.type]}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        type="button"
                        onClick={() => handleDocumentOpen(document, openDocument)}
                        disabled={documentActionId === document.id}
                      >
                        View
                      </button>
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        type="button"
                        onClick={() => handleDocumentOpen(document, downloadDocument)}
                        disabled={documentActionId === document.id}
                      >
                        Download
                      </button>
                      <button
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        type="button"
                        onClick={() => setConfirm({ title: "Delete document", message: "Delete this document?", onConfirm: () => handleDocumentDelete(document.id) })}
                        disabled={documentActionId === document.id}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        )}
        <ConfirmDialog
          open={Boolean(confirm)}
          title={confirm?.title}
          message={confirm?.message}
          confirmLabel="Delete"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const action = confirm?.onConfirm;
            setConfirm(null);
            action?.();
          }}
        />
      </section>
    </main>
  );
}
