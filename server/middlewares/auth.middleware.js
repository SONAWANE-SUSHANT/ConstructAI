import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required.", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      throw new AppError("User no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
