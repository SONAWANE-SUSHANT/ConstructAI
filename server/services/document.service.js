import fs from "fs/promises";
import path from "path";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const documentTypes = ["BOQ", "BLUEPRINT", "CONTRACT", "MATERIAL_PRICE_LIST", "SUPPLIER_QUOTATION"];

const documentSelect = {
  id: true,
  title: true,
  type: true,
  originalName: true,
  fileName: true,
  mimeType: true,
  size: true,
  path: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
};

const serializeDocument = (document) => ({
  ...document,
  path: undefined,
});

const assertProjectAccess = async (ownerId, projectId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError("Project not found.", 404);
  }
};

export const listProjectDocuments = async (ownerId, projectId) => {
  await assertProjectAccess(ownerId, projectId);

  const documents = await prisma.document.findMany({
    where: { projectId },
    select: documentSelect,
    orderBy: { createdAt: "desc" },
  });

  return documents.map(serializeDocument);
};

export const uploadProjectDocument = async (ownerId, projectId, payload, file) => {
  try {
    await assertProjectAccess(ownerId, projectId);

    if (!file) {
      throw new AppError("Document file is required.", 400);
    }

    if (!documentTypes.includes(payload.type)) {
      throw new AppError("Choose a valid document type.", 400);
    }

    const document = await prisma.document.create({
      data: {
        title: payload.title?.trim() || file.originalname,
        type: payload.type,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        projectId,
      },
      select: documentSelect,
    });

    return serializeDocument(document);
  } catch (error) {
    if (file?.path) {
      await fs.unlink(file.path).catch(() => {});
    }
    throw error;
  }
};

export const getDocument = async (ownerId, documentId) => {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      project: { ownerId },
    },
    select: documentSelect,
  });

  if (!document) {
    throw new AppError("Document not found.", 404);
  }

  return document;
};

export const deleteDocument = async (ownerId, documentId) => {
  const document = await getDocument(ownerId, documentId);

  await prisma.document.delete({ where: { id: documentId } });
  await fs.unlink(document.path).catch(() => {});
};

export const getDocumentFile = async (ownerId, documentId) => {
  const document = await getDocument(ownerId, documentId);
  return {
    ...document,
    absolutePath: path.resolve(document.path),
  };
};
