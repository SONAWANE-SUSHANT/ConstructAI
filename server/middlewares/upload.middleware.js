import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

const uploadDir = path.resolve("uploads", "documents");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});
