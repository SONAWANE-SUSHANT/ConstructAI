import * as analyticsService from "../services/analytics.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const dashboard = await analyticsService.getDashboardStats(req.user.id);
    res.status(200).json({ dashboard });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await analyticsService.getReports(req.user.id, req.query);
    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};
