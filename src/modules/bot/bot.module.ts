import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { UpdateBot } from "./bot.update";

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.BOT_TOKEN as string,
      }),
    }),
  ],
  providers: [UpdateBot],
})
export class BotModule {}
