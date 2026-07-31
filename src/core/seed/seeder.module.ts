import { Global, Module } from "@nestjs/common";
import { UserSeeder } from "./users.seeder";
import { PrismaModule } from "../database/prisma.module";

@Global()
@Module({
    imports:[PrismaModule],
    providers:[UserSeeder],
    exports:[UserSeeder]
})

export class SeederModule {} 