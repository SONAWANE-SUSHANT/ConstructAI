import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createProject, getProject, projectStatuses, updateProject } from "../../api/projects";

const emptyForm = {
  name: "",
  clientName: "",
  location: "",
  status: "PLANNING",
  startDate: "",
  endDate: "",
  budget: "",
  description: "",
};

const formatDateInput = (value) => (value ? value.slice(0, 10) : "");

const normalizeForm = (project) => ({
  name: project.name || "",
  clientName: project.clientName || "",
  location: project.location || "",
  status: project.status || "PLANNING",
  startDate: formatDateInput(project.startDate),
  endDate: formatDateInput(project.endDate),
  budget: project.budget ?? "",
  description: project.description || "",
});

export default function CreateProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!isEditing) return;

      setLoading(true);
      setApiError("");

      try {
        const project = await getProject(id);
        setForm(normalizeForm(project));
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load this project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, isEditing]);

  const title = useMemo(() => (isEditing ? "Edit project" : "Create project"), [isEditing]);

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = "Project name must be at least 2 characters.";
    }
    if (form.budget !== "" && (Number.isNaN(Number(form.budget)) || Number(form.budget) < 0)) {
      nextErrors.budget = "Budget must be a positive number.";
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      nextErrors.endDate = "End date cannot be before start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError("");

    const payload = {
      ...form,
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      budget: form.budget === "" ? "" : Number(form.budget),
    };

    try {
      const project = isEditing ? await updateProject(id, payload) : await createProject(payload);
      navigate(`/projects/${project.id}`);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to save this project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <section className="mx-auto w-full max-w-4xl rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
          Loading project...
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Projects</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">{title}</h1>
          </div>
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white"
            to={isEditing ? `/projects/${id}` : "/projects"}
          >
            Cancel
          </Link>
        </div>

        <form className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200" onSubmit={handleSubmit} noValidate>
          {apiError ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Project name</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Residential tower phase 2"
              />
              {errors.name ? <span className="mt-1 block text-sm text-red-600">{errors.name}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Client</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Client or company"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Site location"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {projectStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Budget</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                type="number"
                min="0"
                step="0.01"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="0.00"
              />
              {errors.budget ? <span className="mt-1 block text-sm text-red-600">{errors.budget}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start date</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">End date</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
              {errors.endDate ? <span className="mt-1 block text-sm text-red-600">{errors.endDate}</span> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Scope, milestones, site notes, or constraints"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="rounded-lg bg-cyan-700 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-400"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
