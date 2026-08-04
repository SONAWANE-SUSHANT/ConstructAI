import api from "./axios";

export const projectStatuses = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const statusLabels = projectStatuses.reduce((labels, status) => {
  labels[status.value] = status.label;
  return labels;
}, {});

export const getProjects = async (params) => {
  const { data } = await api.get("/projects", { params });
  return data;
};

export const getProject = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data.project;
};

export const createProject = async (payload) => {
  const { data } = await api.post("/projects", payload);
  return data.project;
};

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data.project;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};
