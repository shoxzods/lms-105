import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus, Prisma, UserRole } from "@prisma/client";
import { QueryPaymentDto } from "./dto/query-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

interface Actor {
  id: number;
  role: UserRole;
}

const ADMIN_ROLES: UserRole[] = [UserRole.SUPERADMIN, UserRole.ADMIN];

const paymentInclude = {
  user: {
    select: { id: true, full_name: true, phone: true, file: true },
  },
  courses: {
    select: {
      id: true,
      name: true,
      categories: { select: { id: true, name: true } },
    },
  },
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(actor: Actor, payload: CreatePaymentDto) {
    const isAdmin = ADMIN_ROLES.includes(actor.role);

    /* Student faqat o'ziga to'lov qiladi, admin esa boshqa student uchun */
    const userId = isAdmin && payload.userId ? payload.userId : actor.id;

    /* Holatni faqat admin belgilaydi, student uchun doim PENDING */
    const status =
      isAdmin && payload.status ? payload.status : PaymentStatus.PENDING;

    if (isAdmin) {
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!student || student.role !== UserRole.STUDENT) {
        throw new NotFoundException(
          `Student not found with this id=${userId}`,
        );
      }
    }

    const course = await this.prisma.courses.findUnique({
      where: { id: payload.courseId },
    });

    if (!course || !course.published) {
      throw new NotFoundException(
        `Course not found with this id=${payload.courseId}`,
      );
    }

    const exist = await this.prisma.purchasedCourse.findUnique({
      where: { userId_courseId: { userId, courseId: payload.courseId } },
    });

    /* Admin holatni qayta belgilay oladi, student esa navbatni buza olmaydi */
    if (!isAdmin) {
      if (exist?.status === PaymentStatus.COMPLETED) {
        throw new ConflictException("You already have access to this course");
      }

      if (exist?.status === PaymentStatus.PENDING) {
        throw new ConflictException(
          "Your payment is already waiting for review",
        );
      }
    }

    const payment = await this.prisma.purchasedCourse.upsert({
      where: { userId_courseId: { userId, courseId: payload.courseId } },
      create: {
        userId,
        courseId: payload.courseId,
        price: course.price,
        status,
      },
      update: {
        price: course.price,
        status,
      },
      include: paymentInclude,
    });

    return {
      success: true,
      message: isAdmin
        ? "Payment created"
        : "Payment created. Waiting for admin approval",
      data: payment,
    };
  }

  async findAll(query: QueryPaymentDto, actor?: Actor) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const { status, courseId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchasedCourseWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    // Teacher bo'lsa — faqat o'z kurslariga tegishli to'lovlarni filtrlaydi
    if (actor?.role === UserRole.TEACHER) {
      const profile = await this.prisma.mentorProfile.findFirst({
        where: { userId: actor.id },
        select: { id: true },
      });

      if (!profile) {
        return {
          success: true,
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }

      where.courses = { mentorId: profile.id };
    }

    const [payments, total] = await this.prisma.$transaction([
      this.prisma.purchasedCourse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { create_at: "desc" },
        include: paymentInclude,
      }),
      this.prisma.purchasedCourse.count({ where }),
    ]);

    return {
      success: true,
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMy(userId: number) {
    const payments = await this.prisma.purchasedCourse.findMany({
      where: { userId },
      orderBy: { create_at: "desc" },
      include: paymentInclude,
    });

    return { success: true, data: payments };
  }

  async updateStatus(
    userId: number,
    courseId: number,
    payload: UpdatePaymentDto,
  ) {
    const exist = await this.prisma.purchasedCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!exist) {
      throw new NotFoundException(`Payment not found`);
    }

    const payment = await this.prisma.purchasedCourse.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: payload.status },
      include: paymentInclude,
    });

    return {
      success: true,
      message:
        payload.status === PaymentStatus.COMPLETED
          ? "Payment approved. Student can access the course."
          : "Payment rejected.",
      data: payment,
    };
  }
}
