import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const projectStatuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

const projectSelect = {
  id: true,
  name: true,
  description: true,
  clientName: true,
  location: true,
  status: true,
  startDate: true,
  endDate: true,
  budget: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
};

const normalizeProjectPayload = (payload) => ({
  name: payload.name.trim(),
  description: payload.description?.trim() || null,
  clientName: payload.clientName?.trim() || null,
  location: payload.location?.trim() || null,
  status: payload.status || "PLANNING",
  startDate: payload.startDate ? new Date(payload.startDate) : null,
  endDate: payload.endDate ? new Date(payload.endDate) : null,
  budget: payload.budget === undefined || payload.budget === null || payload.budget === "" ? null : Number(payload.budget),
});

const serializeProject = (project) => ({
  ...project,
  budget: project.budget === null || project.budget === undefined ? null : Number(project.budget),
});

export const listProjects = async (ownerId, query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 8, 1), 50);
  const search = String(query.search || "").trim();
  const status = String(query.status || "").trim();

  const where = {
    ownerId,
    ...(projectStatuses.includes(status) ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { clientName: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      select: projectSelect,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects: projects.map(serializeProject),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const createProject = async (ownerId, payload) => {
  const project = await prisma.project.create({
    data: {
      ...normalizeProjectPayload(payload),
      ownerId,
    },
    select: projectSelect,
  });

  return serializeProject(project);
};

export const getProjectById = async (ownerId, projectId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError("Project not found.", 404);
  }

  return serializeProject(project);
};

export const updateProject = async (ownerId, projectId, payload) => {
  await getProjectById(ownerId, projectId);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: normalizeProjectPayload(payload),
    select: projectSelect,
  });

  return serializeProject(project);
};

export const deleteProject = async (ownerId, projectId) => {
  await getProjectById(ownerId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
};
