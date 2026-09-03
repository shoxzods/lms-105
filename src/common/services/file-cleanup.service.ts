import { Injectable, Logger } from "@nestjs/common";
import { unlink } from "fs/promises";
import { join } from "path";

export type UploadFolder = "images" | "videos" | "files";

@Injectable()
export class FileCleanup {
  private readonly logger = new Logger(FileCleanup.name);

  private pathOf(folder: UploadFolder, name: string) {
    return join(process.cwd(), "src", "uploads", folder, name);
  }

  async remove(folder: UploadFolder, name?: string | null) {
    if (!name) return;

    try {
      await unlink(this.pathOf(folder, name));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "ENOENT") {
        this.logger.warn(`Faylni o'chirib bo'lmadi: ${folder}/${name}`);
      }
    }
  }

  async removeMany(folder: UploadFolder, names: (string | null | undefined)[]) {
    await Promise.all(names.map((name) => this.remove(folder, name)));
  }
}
