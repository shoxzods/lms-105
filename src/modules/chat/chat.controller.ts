import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { ChatService } from "./chat.service";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: "Foydalanuvchi kira oladigan kurs xonalari" })
  @Get("rooms")
  async rooms(@Req() req: Request) {
    return { success: true, data: await this.chatService.rooms(req["user"]) };
  }

  @ApiOperation({ summary: "Kurs suhbati tarixi" })
  @Get(":courseId")
  async history(
    @Param("courseId", ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    await this.chatService.assertCanJoin(req["user"], courseId);

    return { success: true, data: await this.chatService.history(courseId) };
  }
}
