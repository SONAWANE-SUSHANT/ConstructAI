import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResources, resourceStatusLabels } from "../api/resources";
import DataTable from "./DataTable";

const sections = [
  { type: "materials", title: "Materials", href: "/resources/materials" },
  { type: "workers", title: "Workers", href: "/resources/workers" },
  { type: "equipment", title: "Equipment", href: "/resources/equipment" },
];

export default function ProjectResourcesPanel({ projectId }) {
  const [data, setData] = useState({ materials: [], workers: [], equipment: [] });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setApiError("");
      try {
        const [materials, workers, equipment] = await Promise.all([
          getResources("materials", { projectId, limit: 5 }),
          getResources("workers", { projectId, limit: 5 }),
          getResources("equipment", { projectId, limit: 5 }),
        ]);
        setData({ materials: materials.items, workers: workers.items, equipment: equipment.items });
      } catch (error) {
        setApiError(error.response?.data?.message || "Unable to load resources.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [projectId]);

  const columns = [
    { key: "name", header: "Name" },
    { key: "status", header: "Status", render: (row) => resourceStatusLabels[row.status] },
    { key: "updatedAt", header: "Updated", render: (row) => new Date(row.updatedAt).toLocaleDateString() },
  ];

  if (loading) {
    return <div className="rounded-lg bg-white p-6 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">Loading resources...</div>;
  }

  return (
    <section className="mt-5 space-y-5">
      {apiError ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div> : null}
      {sections.map((section) => (
        <div key={section.type}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
            <Link className="text-sm font-semibold text-cyan-700 hover:text-cyan-800" to={section.href}>Manage</Link>
          </div>
          <DataTable columns={columns} rows={data[section.type]} emptyMessage={`No ${section.title.toLowerCase()} assigned.`} />
        </div>
      ))}
    </section>
  );
}
