import { BadRequestException } from "@nestjs/common";
import type { Request } from "express";

const DOCUMENT_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
];

const PREFIXES = ["image/", "video/", "audio/"];

export function materialFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const allowed =
    DOCUMENT_MIME.includes(file.mimetype) ||
    PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));

  if (!allowed) {
    cb(
      new BadRequestException(
        `Bu turdagi fayl qabul qilinmaydi: ${file.mimetype}`,
      ),
      false,
    );
    return;
  }

  cb(null, true);
}
