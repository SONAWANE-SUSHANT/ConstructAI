import * as documentService from "../services/document.service.js";

export const listProjectDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.listProjectDocuments(req.user.id, req.params.projectId);
    res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

export const uploadProjectDocument = async (req, res, next) => {
  try {
    const document = await documentService.uploadProjectDocument(req.user.id, req.params.projectId, req.body, req.file);
    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocument(req.user.id, req.params.id);
    res.status(200).json({ document: { ...document, path: undefined } });
  } catch (error) {
    next(error);
  }
};

export const viewDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentFile(req.user.id, req.params.id);
    res.type(document.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${document.originalName}"`);
    res.sendFile(document.absolutePath);
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentFile(req.user.id, req.params.id);
    res.download(document.absolutePath, document.originalName);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    await documentService.deleteDocument(req.user.id, req.params.id);
    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    next(error);
  }
};
