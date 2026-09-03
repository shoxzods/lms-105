import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import hashPassword from "src/common/config/hash";

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}
  async onModuleInit() {
    const phone = process.env.SUPERADMIN_PHONE;
    const password = process.env.USER_PASSWORD;
    const full_name = process.env.SUPERADMIN_NAME ?? "Superadmin";

    if (!phone || !password) {
      return Logger.warn(
        "⚠️  SUPERADMIN_PHONE yoki USER_PASSWORD berilmagan — superadmin yaratilmadi",
      );
    }

    const existUser = await this.prisma.user.findUnique({ where: { phone } });

    if (existUser) {
      return Logger.log("✅ Superadmin already exists");
    }

    await this.prisma.user.create({
      data: {
        full_name,
        phone,
        password: await hashPassword(password),
        role: "SUPERADMIN",
      },
    });

    Logger.log("✅ Superadmin created");
  }
}
