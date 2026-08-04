import * as resourceService from "../services/resource.service.js";

export const listResources = async (req, res, next) => {
  try {
    const result = await resourceService.listResources(req.user.id, req.params.type, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const item = await resourceService.createResource(req.user.id, req.params.type, req.body);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const item = await resourceService.updateResource(req.user.id, req.params.type, req.params.id, req.body);
    res.status(200).json({ item });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    await resourceService.deleteResource(req.user.id, req.params.type, req.params.id);
    res.status(200).json({ message: "Resource deleted successfully." });
  } catch (error) {
    next(error);
  }
};
