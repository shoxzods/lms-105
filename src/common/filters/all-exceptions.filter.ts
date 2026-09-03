import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exception");

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== "http") {
      this.logger.error(
        `${host.getType()} kontekstidagi xato`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.describe(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private describe(exception: unknown): { status: number; message: unknown } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      return {
        status: exception.getStatus(),
        message:
          typeof body === "object" && body !== null && "message" in body
            ? (body as { message: unknown }).message
            : body,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.describePrisma(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Serverda kutilmagan xatolik yuz berdi",
    };
  }

  private describePrisma(error: Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = (error.meta?.target as string[] | undefined)?.join(", ");

      return {
        status: HttpStatus.CONFLICT,
        message: fields
          ? `Bu qiymat allaqachon band: ${fields}`
          : "Bu qiymat allaqachon mavjud",
      };
    }

    if (error.code === "P2025") {
      return {
        status: HttpStatus.NOT_FOUND,
        message: "So'ralgan yozuv topilmadi",
      };
    }

    if (error.code === "P2003") {
      return {
        status: HttpStatus.CONFLICT,
        message: "Bu yozuvga boshqa ma'lumotlar bog'langan",
      };
    }

    return {
      status: HttpStatus.BAD_REQUEST,
      message: "Ma'lumotlar bazasi so'rovi bajarilmadi",
    };
  }
}
