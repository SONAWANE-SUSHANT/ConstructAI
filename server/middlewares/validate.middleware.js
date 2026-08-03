import { AppError } from "../utils/AppError.js";

export const validate = (rules) => (req, _res, next) => {
  const errors = rules
    .map((rule) => rule(req.body))
    .filter(Boolean);

  if (errors.length > 0) {
    return next(new AppError(errors[0], 400));
  }

  return next();
};
