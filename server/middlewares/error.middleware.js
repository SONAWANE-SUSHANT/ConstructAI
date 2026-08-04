import { Prisma } from "@prisma/client";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error.";

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired authentication token.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    statusCode = 409;
    message = "A user with this email already exists.";
  }

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Document file must be 25MB or smaller.";
  }

  if (message === "Origin is not allowed by CORS.") {
    statusCode = 403;
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};
