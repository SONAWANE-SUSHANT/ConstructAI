import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { generateToken } from "../utils/jwt.js";

const SALT_ROUNDS = 12;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: publicUserSelect,
  });

  return {
    user,
    token: generateToken({ id: user.id }),
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    token: generateToken({ id: user.id }),
  };
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

export const updateUserProfile = async (userId, { name, email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const emailOwner = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (emailOwner && emailOwner.id !== userId) {
    throw new AppError("A user with this email already exists.", 409);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: name.trim(),
      email: normalizedEmail,
    },
    select: publicUserSelect,
  });
};
