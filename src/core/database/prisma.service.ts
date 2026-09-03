import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({ adapter, log: ["error", "warn"] });
  }
  async onModuleInit() {
    await this.$connect();
    Logger.log("✅ Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    Logger.log("❌ Database disconnected");
  }
}
