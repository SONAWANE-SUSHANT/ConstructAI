import * as aiService from "../services/ai.service.js";

export const getReadiness = (_req, res) => {
  res.status(200).json({ ai: aiService.getAiReadiness() });
};
