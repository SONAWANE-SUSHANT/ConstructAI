import api from "./axios";

export const documentTypes = [
  { value: "BOQ", label: "BOQ" },
  { value: "BLUEPRINT", label: "Blueprint" },
  { value: "CONTRACT", label: "Contract" },
  { value: "MATERIAL_PRICE_LIST", label: "Material Price List" },
  { value: "SUPPLIER_QUOTATION", label: "Supplier Quotation" },
];

export const documentTypeLabels = documentTypes.reduce((labels, type) => {
  labels[type.value] = type.label;
  return labels;
}, {});

export const getProjectDocuments = async (projectId) => {
  const { data } = await api.get(`/documents/project/${projectId}`);
  return data.documents;
};

export const uploadProjectDocument = async (projectId, payload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("type", payload.type);
  formData.append("file", payload.file);

  const { data } = await api.post(`/documents/project/${projectId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.document;
};

export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
};

export const openDocument = async (document) => {
  const { data } = await api.get(`/documents/${document.id}/view`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

export const downloadDocument = async (document) => {
  const { data } = await api.get(`/documents/${document.id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.originalName;
  link.click();
  URL.revokeObjectURL(url);
};
