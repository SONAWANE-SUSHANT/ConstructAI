import * as projectService from "../services/project.service.js";

export const listProjects = async (req, res, next) => {
  try {
    const result = await projectService.listProjects(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.user.id, req.params.id);
    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.user.id, req.params.id);
    res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    next(error);
  }
};
