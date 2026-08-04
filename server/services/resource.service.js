import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const resourceStatuses = ["AVAILABLE", "ASSIGNED", "IN_USE", "MAINTENANCE", "UNAVAILABLE"];

const configs = {
  materials: {
    model: prisma.material,
    searchFields: ["name", "category", "supplier", "unit", "notes"],
    moneyFields: ["unitCost"],
    numberFields: ["quantity"],
    required: ["name", "unit", "projectId"],
    select: {
      id: true, name: true, category: true, unit: true, quantity: true, unitCost: true, status: true, supplier: true, notes: true, projectId: true,
      project: { select: { name: true } }, createdAt: true, updatedAt: true,
    },
  },
  workers: {
    model: prisma.worker,
    searchFields: ["name", "role", "phone", "notes"],
    moneyFields: ["dailyRate"],
    required: ["name", "role", "projectId"],
    select: {
      id: true, name: true, role: true, phone: true, dailyRate: true, status: true, notes: true, projectId: true,
      project: { select: { name: true } }, createdAt: true, updatedAt: true,
    },
  },
  equipment: {
    model: prisma.equipment,
    searchFields: ["name", "type", "identifier", "notes"],
    moneyFields: ["dailyRate"],
    required: ["name", "type", "projectId"],
    select: {
      id: true, name: true, type: true, identifier: true, dailyRate: true, status: true, notes: true, projectId: true,
      project: { select: { name: true } }, createdAt: true, updatedAt: true,
    },
  },
};

const configFor = (type) => {
  const config = configs[type];
  if (!config) throw new AppError("Resource type not found.", 404);
  return config;
};

const serialize = (item) => {
  const next = { ...item, projectName: item.project?.name || "", project: undefined };
  ["quantity", "unitCost", "dailyRate"].forEach((field) => {
    if (next[field] !== undefined && next[field] !== null) next[field] = Number(next[field]);
  });
  return next;
};

const assertProjectAccess = async (ownerId, projectId) => {
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId }, select: { id: true } });
  if (!project) throw new AppError("Project not found.", 404);
};

const normalize = (type, payload) => {
  const config = configFor(type);
  config.required.forEach((field) => {
    if (!String(payload[field] || "").trim()) throw new AppError(`${field} is required.`, 400);
  });

  const data = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (config.moneyFields?.includes(key) || config.numberFields?.includes(key)) {
      data[key] = value === "" || value === null ? null : Number(value);
      return;
    }
    data[key] = typeof value === "string" ? value.trim() || null : value;
  });

  data.status = resourceStatuses.includes(data.status) ? data.status : "AVAILABLE";
  return data;
};

export const listResources = async (ownerId, type, query = {}) => {
  const config = configFor(type);
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const search = String(query.search || "").trim();
  const status = String(query.status || "").trim();
  const projectId = String(query.projectId || "").trim();

  const where = {
    project: { ownerId },
    ...(projectId ? { projectId } : {}),
    ...(resourceStatuses.includes(status) ? { status } : {}),
    ...(search ? { OR: config.searchFields.map((field) => ({ [field]: { contains: search, mode: "insensitive" } })) } : {}),
  };

  const [items, total] = await prisma.$transaction([
    config.model.findMany({ where, select: config.select, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    config.model.count({ where }),
  ]);

  return { items: items.map(serialize), pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } };
};

export const createResource = async (ownerId, type, payload) => {
  const config = configFor(type);
  await assertProjectAccess(ownerId, payload.projectId);
  const item = await config.model.create({ data: normalize(type, payload), select: config.select });
  return serialize(item);
};

export const updateResource = async (ownerId, type, id, payload) => {
  const config = configFor(type);
  const existing = await config.model.findFirst({ where: { id, project: { ownerId } }, select: { id: true } });
  if (!existing) throw new AppError("Resource not found.", 404);
  if (payload.projectId) await assertProjectAccess(ownerId, payload.projectId);
  const item = await config.model.update({ where: { id }, data: normalize(type, payload), select: config.select });
  return serialize(item);
};

export const deleteResource = async (ownerId, type, id) => {
  const config = configFor(type);
  const existing = await config.model.findFirst({ where: { id, project: { ownerId } }, select: { id: true } });
  if (!existing) throw new AppError("Resource not found.", 404);
  await config.model.delete({ where: { id } });
};
