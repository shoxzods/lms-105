import { Ctx, On, Start, Update } from "nestjs-telegraf";
import { Status } from "@prisma/client";
import { PrismaService } from "src/core/database/prisma.service";
import { Context, Markup } from "telegraf";

const OTP_MINUTES = 3;

function normalizePhone(raw: string) {
  return "+" + raw.replace(/\D/g, "");
}

@Update()
export class UpdateBot {
  constructor(private prisma: PrismaService) {}
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      "Assalomu alaykum Hurmatli Mijoz 😊\n\n Telefon raqamingizni yuboring va tasdiqlash kodingizni oling ✅",
      Markup.keyboard([
        Markup.button.contactRequest("📱Telefon raqamni yuborish"),
      ])
        .resize()
        .oneTime(),
    );
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (!message || !("contact" in message)) return;

    const contact = message.contact;

    if (contact.user_id !== ctx.from?.id) {
      await ctx.reply("Iltimos, o'zingizning raqamingizni yuboring ❗️");
      return;
    }

    const phone = normalizePhone(contact.phone_number);

    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      await ctx.reply(
        `Bu raqam ro'yxatdan o'tmagan:\n${phone}\n\nAvval saytda ro'yxatdan o'ting.`,
        Markup.removeKeyboard(),
      );
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires_at = new Date(Date.now() + OTP_MINUTES * 60 * 1000);

    /*
      Hisob hali tasdiqlanmagan bo'lsa — ro'yxatdan o'tish kodi kerak.
      Tasdiqlangan bo'lsa, odam faqat parolini unutgani uchun keladi.
      Shuning uchun kod mos jadvalga yoziladi.
    */
    const isNewAccount = user.status === Status.PENDING;

    if (isNewAccount) {
      await this.prisma.telegramOtp.create({
        data: { userId: user.id, otp, expires_at },
      });
    } else {
      await this.prisma.resetPass.create({
        data: { userId: user.id, otp, expires_at },
      });
    }

    const title = isNewAccount
      ? "Ro'yxatdan o'tishni tasdiqlash kodi"
      : "Parolni tiklash kodi";

    await ctx.reply(`${title}:\n\n${otp}`, Markup.removeKeyboard());
  }
}
