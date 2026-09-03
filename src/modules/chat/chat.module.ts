import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CourseOwner } from "src/common/services/course-owner.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, CourseOwner],
})
export class ChatModule {}
