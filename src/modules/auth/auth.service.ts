import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../core/database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtToken } from "../../common/config/jwt";
import { RegisterDto } from "./dto/register.dto";
import { PaymentStatus, Status, UserRole } from "@prisma/client";
import hashPassword from "../../common/config/hash";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshDto } from "./dto/refresh.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtToken: JwtToken,
  ) {}

  async login(req:any, payload: LoginDto) {
    console.log(req)

    const existUser = await this.prisma.user.findFirst({
      where: {
        phone: payload.phone,
      },
    });

    if (!existUser) {
      throw new UnauthorizedException("Phone or password is incorrect");
    }

    if (!(await bcrypt.compare(payload.password, existUser.password))) {
      throw new UnauthorizedException("Phone or password is incorrect");
    }

    /* Telegram orqali tasdiqlanmagan hisob kira olmaydi */
    if (existUser.status === Status.PENDING) {
      throw new UnauthorizedException(
        "Hisobingiz tasdiqlanmagan. Telegram bot orqali kodni oling",
      );
    }

    if (existUser.role === UserRole.STUDENT) {
      const approved = await this.prisma.purchasedCourse.count({
        where: { userId: existUser.id, status: PaymentStatus.COMPLETED },
      });

      if (approved === 0) {
        throw new ForbiddenException(
          "To'lovingiz hali admin tomonidan tasdiqlanmagan. Iltimos, kuting yoki adminga murojaat qiling.",
        );
      }
    }

    return {
      success: true,
      role:req.user,
      accessToken: this.jwtToken.jwtAccessToken({
        id: existUser.id,
        full_name: existUser.full_name,
        role: existUser.role,
      }),

      refreshToken: this.jwtToken.jwtRefreshToken({
        id: existUser.id,
        full_name: existUser.full_name,
        role: existUser.role,
      }),
    };
  }

  async register(payload: RegisterDto) {
    const exist = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
    });

    if (exist) {
      throw new ConflictException("User already exists with this phone");
    }

    const user = await this.prisma.user.create({
      data: {
        ...payload,
        role: UserRole.STUDENT,
        status: Status.PENDING,
        password: await hashPassword(payload.password),
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        role: true,
        status: true,
        create_at: true,
      },
    });

    return {
      success: true,
      message: "Ro'yxatdan o'tdingiz. Telegram bot orqali kodni oling",
      data: user,
    };
  }

  /**
   * Telefon va kodni tekshiradi.
   *
   * Kodni bot `telegram_otps` ga yozadi — ham ro'yxatdan o'tishda,
   * ham parolni tiklashda o'sha jadval ishlatiladi.
   */
  private async findUserByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      throw new NotFoundException("Bu raqam ro'yxatdan o'tmagan");
    }

    return user;
  }

  /** Kod muddati va mosligini tekshiradi — ikkala jadval uchun umumiy */
  private assertOtp(
    record: { otp: string; expires_at: Date } | null,
    otp: string,
  ) {
    if (!record) {
      throw new BadRequestException("Kod topilmadi. Botdan qayta oling");
    }

    if (record.expires_at < new Date()) {
      throw new BadRequestException("Kod muddati tugagan. Qayta oling");
    }

    if (record.otp !== otp) {
      throw new BadRequestException("Kod xato kiritildi");
    }
  }

  private async checkOtp(phone: string, otp: string) {
    const user = await this.findUserByPhone(phone);

    const record = await this.prisma.telegramOtp.findFirst({
      where: { userId: user.id },
      orderBy: { create_at: "desc" },
    });

    this.assertOtp(record, otp);

    return { user };
  }

  private async checkResetOtp(phone: string, otp: string) {
    const user = await this.findUserByPhone(phone);

    const record = await this.prisma.resetPass.findFirst({
      where: { userId: user.id },
      orderBy: { create_at: "desc" },
    });

    this.assertOtp(record, otp);

    return { user };
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { user } = await this.checkOtp(payload.phone, payload.otp);

    const [, activated] = await this.prisma.$transaction([
      this.prisma.telegramOtp.deleteMany({ where: { userId: user.id } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { status: Status.ACTIVE },
      }),
    ]);

    return {
      success: true,
      message: "Hisob tasdiqlandi",
      accessToken: this.jwtToken.jwtAccessToken({
        id: activated.id,
        full_name: activated.full_name,
        role: activated.role,
      }),
      refreshToken: this.jwtToken.jwtRefreshToken({
        id: activated.id,
        full_name: activated.full_name,
        role: activated.role,
      }),
    };
  }

  async refresh(payload: RefreshDto) {
    let decoded: { id: number };

    try {
      decoded = this.jwtToken.verify(payload.refreshToken);
    } catch {
      throw new UnauthorizedException("Refresh token yaroqsiz yoki eskirgan");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, full_name: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedException("Foydalanuvchi topilmadi");
    }

    if (user.status === Status.PENDING) {
      throw new UnauthorizedException("Hisobingiz tasdiqlanmagan");
    }

    return {
      success: true,
      accessToken: this.jwtToken.jwtAccessToken({
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      }),
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { user } = await this.checkResetOtp(payload.phone, payload.otp);

    /* `$transaction` massivi ichida await bo'lmaydi — oldindan hisoblanadi */
    const hashed = await hashPassword(payload.password);

    await this.prisma.$transaction([
      /* Ishlatilgan kod qayta yaramasin */
      this.prisma.resetPass.deleteMany({ where: { userId: user.id } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
    ]);

    return {
      success: true,
      message: "Parol o'zgartirildi. Endi kirishingiz mumkin",
    };
  }
}
