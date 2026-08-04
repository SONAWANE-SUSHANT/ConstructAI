import { useEffect, useState } from "react";
import { getProjects } from "../../api/projects";
import { createResource, deleteResource, getResources, resourceStatuses, resourceStatusLabels, updateResource } from "../../api/resources";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "../../components/DataTable";
import PageShell from "../../components/PageShell";
import { useToast } from "../../hooks/useToast";

const pageConfig = {
  materials: {
    title: "Materials",
    description: "Manage construction materials by project.",
    empty: { name: "", category: "", unit: "", quantity: 0, unitCost: "", status: "AVAILABLE", supplier: "", notes: "", projectId: "" },
    fields: [
      ["name", "Name"], ["category", "Category"], ["unit", "Unit"], ["quantity", "Quantity", "number"], ["unitCost", "Unit Cost", "number"], ["supplier", "Supplier"],
    ],
    columns: ["name", "category", "unit", "quantity", "unitCost", "supplier"],
  },
  workers: {
    title: "Workers",
    description: "Manage labor assignments and rates.",
    empty: { name: "", role: "", phone: "", dailyRate: "", status: "AVAILABLE", notes: "", projectId: "" },
    fields: [["name", "Name"], ["role", "Role"], ["phone", "Phone"], ["dailyRate", "Daily Rate", "number"]],
    columns: ["name", "role", "phone", "dailyRate"],
  },
  equipment: {
    title: "Equipment",
    description: "Manage equipment assignments, rates, and availability.",
    empty: { name: "", type: "", identifier: "", dailyRate: "", status: "AVAILABLE", notes: "", projectId: "" },
    fields: [["name", "Name"], ["type", "Type"], ["identifier", "Identifier"], ["dailyRate", "Daily Rate", "number"]],
    columns: ["name", "type", "identifier", "dailyRate"],
  },
};

const money = (value) => (value === null || value === undefined || value === "" ? "" : new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value));

export default function ResourcePage({ type }) {
  const config = pageConfig[type];
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", projectId: "" });
  const [applied, setApplied] = useState(filters);
  const [form, setForm] = useState(config.empty);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      const data = await getProjects({ limit: 50 });
      setProjects(data.projects);
      if (!form.projectId && data.projects[0]) setForm((current) => ({ ...current, projectId: data.projects[0].id }));
    };
    loadProjects().catch(() => {});
  }, [form.projectId]);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setApiError("");
      try {
        const data = await getResources(type, { ...applied, page: pagination.page, limit: pagination.limit });
        setItems(data.items);
        setPagination(data.pagination);
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load resources.");
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [applied, pagination.limit, pagination.page, type]);

  const columns = [
    ...config.columns.map((key) => ({
      key,
      header: key.replace(/([A-Z])/g, " $1"),
      render: (row) => key.toLowerCase().includes("rate") || key.toLowerCase().includes("cost") ? money(row[key]) : row[key],
    })),
    { key: "status", header: "Status", render: (row) => resourceStatusLabels[row.status] },
    { key: "projectName", header: "Project" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700" type="button" onClick={() => startEdit(row)}>Edit</button>
          <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700" type="button" onClick={() => setConfirmDeleteId(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setApiError("");
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const submitFilters = (event) => {
    event.preventDefault();
    setPagination((current) => ({ ...current, page: 1 }));
    setApplied(filters);
  };

  const resetForm = () => {
    setEditingId("");
    setForm({ ...config.empty, projectId: projects[0]?.id || "" });
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...config.empty, ...row, projectId: row.projectId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setApiError("");
    try {
      editingId ? await updateResource(type, editingId, form) : await createResource(type, form);
      notify(editingId ? "Resource updated." : "Resource created.", "success");
      resetForm();
      const data = await getResources(type, { ...applied, page: pagination.page, limit: pagination.limit });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (error) {
      const message = error.userMessage || "Unable to save resource.";
      setApiError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteResource(type, id);
      setItems((current) => current.filter((item) => item.id !== id));
      notify("Resource deleted.", "success");
    } catch (error) {
      const message = error.userMessage || "Unable to delete resource.";
      setApiError(message);
      notify(message, "error");
    } finally {
      setConfirmDeleteId("");
    }
  };

  return (
    <PageShell eyebrow="Resources" title={config.title} description={config.description}>
      {apiError ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div> : null}

      <form className="mb-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={save}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {config.fields.map(([name, label, inputType]) => (
            <label className="block" key={name}>
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" type={inputType || "text"} name={name} value={form[name] ?? ""} onChange={handleFormChange} />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="status" value={form.status} onChange={handleFormChange}>
              {resourceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Project</span>
            <select className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="projectId" value={form.projectId} onChange={handleFormChange}>
              <option value="">Select project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="notes" value={form.notes || ""} onChange={handleFormChange} />
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:bg-cyan-400" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : `Create ${config.title.slice(0, -1)}`}</button>
          {editingId ? <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={resetForm}>Cancel</button> : null}
        </div>
      </form>

      <form className="mb-5 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_180px_220px_auto]" onSubmit={submitFilters}>
        <input className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search resources" />
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All statuses</option>
          {resourceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" name="projectId" value={filters.projectId} onChange={handleFilterChange}>
          <option value="">All projects</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white" type="submit">Filter</button>
      </form>

      {loading ? <div className="rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">Loading...</div> : <DataTable columns={columns} rows={items} emptyMessage="No resources found." />}

      {!loading && pagination.total > 0 ? (
        <div className="mt-5 flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50" type="button" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50" type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete resource"
        message="Delete this resource?"
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteId("")}
        onConfirm={() => remove(confirmDeleteId)}
      />
    </PageShell>
  );
}
