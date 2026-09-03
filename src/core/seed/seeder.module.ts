import { Global, Module } from "@nestjs/common";
import { UserSeeder } from "./user.seeder";

@Global()
@Module({
  providers: [UserSeeder],
  exports: [UserSeeder],
})
export class SeederModule {}
