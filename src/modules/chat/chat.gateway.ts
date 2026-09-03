import { UnauthorizedException } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";
import { Actor } from "src/common/services/course-owner.service";
import { ChatService, roomOf } from "./chat.service";
import { corsOptions } from "src/common/config/cors";

interface JoinPayload {
  courseId: number;
}

interface SendPayload extends JoinPayload {
  text: string;
}

@WebSocketGateway({
  namespace: "/chat",
  cors: corsOptions,
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwt: JwtService,
    private chat: ChatService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;

      if (!token) throw new UnauthorizedException();

      const payload = this.jwt.verify<Actor>(token, {
        secret: process.env.SECRET_KEY,
      });

      client.data.user = { id: payload.id, role: payload.role };
    } catch {
      client.emit("error_message", "Token yaroqsiz yoki muddati tugagan");
      client.disconnect();
    }
  }

  @SubscribeMessage("join")
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinPayload,
  ) {
    const actor: Actor = client.data.user;

    try {
      await this.chat.assertCanJoin(actor, body.courseId);
    } catch (error) {
      client.emit("error_message", (error as Error).message);
      return;
    }

    for (const room of client.rooms) {
      if (room.startsWith("course:")) await client.leave(room);
    }

    await client.join(roomOf(body.courseId));

    client.emit("history", await this.chat.history(body.courseId));
  }

  @SubscribeMessage("message")
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendPayload,
  ) {
    const actor: Actor = client.data.user;
    const text = (body.text ?? "").trim();

    if (!text) return;

    try {
      await this.chat.assertCanJoin(actor, body.courseId);
    } catch (error) {
      client.emit("error_message", (error as Error).message);
      return;
    }

    const saved = await this.chat.save(
      body.courseId,
      actor.id,
      text.slice(0, 2000),
    );

    this.server.to(roomOf(body.courseId)).emit("message", saved);
  }
}
