import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: "[All authenticated users] Get chat rooms accessible to the user" })
  @Get("rooms")
  async rooms(@Req() req: Request) {
    return { success: true, data: await this.chatService.rooms(req["user"]) };
  }

  @ApiOperation({ summary: "[All authenticated users] Get chat history for a course" })
  @Get(":courseId")
  async history(
    @Param("courseId", ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    await this.chatService.assertCanJoin(req["user"], courseId);

    return { success: true, data: await this.chatService.history(courseId) };
  }
}
