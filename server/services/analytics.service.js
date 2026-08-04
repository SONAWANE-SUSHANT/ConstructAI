import prisma from "../config/prisma.js";
import { documentTypes } from "./document.service.js";
import { projectStatuses } from "./project.service.js";

const serializeProject = (project) => ({
  ...project,
  budget: project.budget === null || project.budget === undefined ? null : Number(project.budget),
  documentCount: project._count?.documents ?? project.documentCount ?? 0,
  _count: undefined,
});

const serializeDocument = (document) => ({
  ...document,
  projectName: document.project?.name || "",
  project: undefined,
});

const getDateRange = (query = {}) => {
  const from = query.from ? new Date(query.from) : null;
  const to = query.to ? new Date(query.to) : null;

  return {
    ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
    ...(to && !Number.isNaN(to.getTime()) ? { lte: to } : {}),
  };
};

const getProjectWhere = (ownerId, query = {}) => {
  const dateRange = getDateRange(query);
  const status = String(query.status || "").trim();

  return {
    ownerId,
    ...(projectStatuses.includes(status) ? { status } : {}),
    ...(Object.keys(dateRange).length ? { createdAt: dateRange } : {}),
  };
};

export const getDashboardStats = async (ownerId) => {
  const [totalProjects, activeProjects, completedProjects, budgetAggregate, totalDocuments, statusGroups, recentProjects, recentDocuments] =
    await prisma.$transaction([
      prisma.project.count({ where: { ownerId } }),
      prisma.project.count({ where: { ownerId, status: "ACTIVE" } }),
      prisma.project.count({ where: { ownerId, status: "COMPLETED" } }),
      prisma.project.aggregate({ where: { ownerId }, _sum: { budget: true } }),
      prisma.document.count({ where: { project: { ownerId } } }),
      prisma.project.groupBy({ by: ["status"], where: { ownerId }, _count: { _all: true } }),
      prisma.project.findMany({
        where: { ownerId },
        select: {
          id: true,
          name: true,
          clientName: true,
          location: true,
          status: true,
          budget: true,
          startDate: true,
          endDate: true,
          updatedAt: true,
          _count: { select: { documents: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.document.findMany({
        where: { project: { ownerId } },
        select: {
          id: true,
          title: true,
          type: true,
          originalName: true,
          size: true,
          createdAt: true,
          project: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return {
    summary: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget: budgetAggregate._sum.budget ? Number(budgetAggregate._sum.budget) : 0,
      totalDocuments,
    },
    charts: {
      projectStatus: projectStatuses.map((status) => ({
        status,
        count: statusGroups.find((group) => group.status === status)?._count._all || 0,
      })),
      budgetDistribution: recentProjects.map((project) => ({
        id: project.id,
        name: project.name,
        budget: project.budget ? Number(project.budget) : 0,
      })),
    },
    recentProjects: recentProjects.map(serializeProject),
    recentDocuments: recentDocuments.map(serializeDocument),
  };
};

export const getReports = async (ownerId, query = {}) => {
  const projectWhere = getProjectWhere(ownerId, query);
  const documentType = String(query.documentType || "").trim();
  const documentWhere = {
    project: { ownerId },
    ...(documentTypes.includes(documentType) ? { type: documentType } : {}),
  };

  const [projects, statusGroups, budgetByStatus, documents, documentsByType] = await prisma.$transaction([
    prisma.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        name: true,
        clientName: true,
        location: true,
        status: true,
        budget: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.groupBy({ by: ["status"], where: projectWhere, _count: { _all: true } }),
    prisma.project.groupBy({ by: ["status"], where: projectWhere, _sum: { budget: true } }),
    prisma.document.findMany({
      where: documentWhere,
      select: {
        id: true,
        title: true,
        type: true,
        originalName: true,
        size: true,
        createdAt: true,
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.groupBy({ by: ["type"], where: documentWhere, _count: { _all: true }, _sum: { size: true } }),
  ]);

  return {
    projectSummary: {
      total: projects.length,
      byStatus: projectStatuses.map((status) => ({
        status,
        count: statusGroups.find((group) => group.status === status)?._count._all || 0,
      })),
      projects: projects.map(serializeProject),
    },
    budgetReport: {
      totalBudget: projects.reduce((total, project) => total + Number(project.budget || 0), 0),
      byStatus: projectStatuses.map((status) => ({
        status,
        budget: Number(budgetByStatus.find((group) => group.status === status)?._sum.budget || 0),
      })),
    },
    documentReport: {
      total: documents.length,
      byType: documentTypes.map((type) => {
        const group = documentsByType.find((item) => item.type === type);
        return { type, count: group?._count._all || 0, size: group?._sum.size || 0 };
      }),
      documents: documents.map(serializeDocument),
    },
    timelineReport: projects
      .map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
      }))
      .sort((a, b) => new Date(a.startDate || a.endDate || 0) - new Date(b.startDate || b.endDate || 0)),
  };
};
