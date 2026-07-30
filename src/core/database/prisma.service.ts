import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { error, log, warn } from "console";
import { Pool } from "pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit , OnModuleDestroy {
    constructor() {
        const pool = new Pool({connectionString:process.env.DATABASE_URL});
        const adapter = new PrismaPg(pool);
        super({adapter , log:["error" , "warn"]});
    }

    async onModuleInit() {
        await this.$connect()
        Logger.log("✅ database connected")
    }

    async onModuleDestroy() {
        await this.$disconnect()
        Logger.log("❌ database disconnected")
    }
}