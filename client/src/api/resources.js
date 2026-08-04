import api from "./axios";

export const resourceStatuses = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_USE", label: "In use" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

export const resourceStatusLabels = resourceStatuses.reduce((labels, status) => {
  labels[status.value] = status.label;
  return labels;
}, {});

export const getResources = async (type, params) => {
  const { data } = await api.get(`/resources/${type}`, { params });
  return data;
};

export const createResource = async (type, payload) => {
  const { data } = await api.post(`/resources/${type}`, payload);
  return data.item;
};

export const updateResource = async (type, id, payload) => {
  const { data } = await api.put(`/resources/${type}/${id}`, payload);
  return data.item;
};

export const deleteResource = async (type, id) => {
  const { data } = await api.delete(`/resources/${type}/${id}`);
  return data;
};
