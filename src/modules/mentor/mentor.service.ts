import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateMentorDto } from './dto/create_mentor.dto';
import hashing from "../../common/config/hash"
import { PatchMentorDto } from './dto/patch-mentor.dto';
import { CreateAssistantDto } from './dto/create_assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dot';
import { UserRoles } from '@prisma/client';
import { UpdateStudentDto } from './dto/update-student.dto';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
import { createInvalidObservableTypeError } from 'rxjs/internal/util/throwUnobservableError';

@Injectable()
export class MentorService {
    constructor(private prisma:PrismaService){}

    async getAllMentors(page:number , limit:number) {

        const teachers = await this.prisma.users.findMany(
            {
                where:{
                    role:"TEACHER"
                },
                select:{
                    id:true,
                    full_name:true,
                    phone_number:true,
                    role:true,
                    created_at:true,
                },
                take:limit,
                skip:limit*(page - 1)
            });
            
        return {
            success:true,
            data:teachers
        }
    }


    async getOneMentor(id:number) {
        const mentor = await this.prisma.users.findFirst(
            {
                where:{
                    id:id , 
                    role:"TEACHER"
                },
                select:{
                    id:true,
                    full_name:true,
                    role:true,
                }});
        
        const mentorInfo = await this.prisma.mentorProfile.findFirst({
            where:{
                user_id:id
            },
            select:{
                id:true,
                job:true,
                experience:true,
                description:true,
                courses:true,
                github:true,
                instagram:true,
                linkedIn:true,
                facebook:true,
                telegram:true,
                web_link:true,
            }
        });


        return {
            success:true,
            data:{
                ...mentor,
                userInfo:mentorInfo
            }
        }
    }


    async createMentor(payloud:CreateMentorDto) {
        const hashedPassword = await hashing.HashingPassword(payloud.password)

        try {
        const mentor = await this.
                        prisma.users.
                        createManyAndReturn(
                            {
                                data:{
                                    full_name:payloud.full_name,
                                    phone_number:payloud.phone_number,
                                    password:hashedPassword,
                                    role:"TEACHER"
                                }
                            });

        await this.prisma.mentorProfile.create({
            data:{
                user_id:mentor[0].id,
                experience:payloud.experience,
                job:payloud.job,
                web_link:payloud.web_link,
                description:payloud.description,
                facebook:payloud.facebook,
                telegram:payloud.telegram,
                linkedIn:payloud.linkedIn,
                instagram:payloud.instagram,
                github:payloud.github
            }
        })

        return {
            success:true,
            message:"User created Successfully"
        }
        } catch( err ) {
            if ( err instanceof Error ) {
                throw new BadRequestException("User with this phone_number already exists")
            }
        } 
    }

       async findUsersMentors(name:string) {
        const users = await this.prisma
                            .users
                            .findMany(
                                {
                                    where:{
                                        full_name:{
                                            startsWith:name.trim() , 
                                            mode:"insensitive"},
                                        role:"TEACHER"
                                    },
                                    select:{
                                        id:true,
                                        full_name:true,
                                        phone_number:true,
                                        role:true,
                                        created_at:true,
                                    }
                                })

        return {
            success:true,
            data:users
        }
    }


    async DeleteMentorUser(id:number) {
            const user = await this.prisma.users.findUnique({where:{id:id}});

            if(!user) {
                throw new NotFoundException("User with this id not found")
            }
            
            await this.prisma.mentorProfile.deleteMany({where:{user_id:user.id}});

            await this.prisma.users.deleteMany({
                where: {
                    id:id,
                    role: "TEACHER",
                },
            });
    
            return {
                success:true,
                message:"User deleted Successully"
            }
        }

    async PatchUserMentor(payloud:PatchMentorDto , id:number) {
        
        const hashedPassword = await hashing.HashingPassword(payloud.password);

        try {
        await this.
                        prisma.users.
                        update(
                            {
                                where:{
                                    id:id
                                },

                                data:{
                                    full_name:payloud.full_name,
                                    phone_number:payloud.phone_number,
                                    password:hashedPassword,
                                    role:"TEACHER"
                                }
                            });

        await this.prisma.mentorProfile.updateMany({
            where:{
                user_id:id
            },
            data:{
                experience:payloud.experience,
                job:payloud.job,
                web_link:payloud.web_link,
                description:payloud.description,
                facebook:payloud.facebook,
                telegram:payloud.telegram,
                linkedIn:payloud.linkedIn,
                instagram:payloud.instagram,
                github:payloud.github
            }
        })

        return {
            success:true,
            message:"User updated successully"
        }
    } catch(err) {
        if(err instanceof Error) {
            throw new BadRequestException("User with this phone_number already exists")
        }
    }

    }

 
   async getTeacherAssitants(id:number , page:number , limit:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:id}});
        const findCourse = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                user: {
                                                    select: {
                                                        id:true,
                                                        full_name:true,
                                                        phone_number:true,
                                                        role:true,
                                                        created_at:true
                                                    }
                                                }
                                            },
                                            take:limit,
                                            skip:limit*(page - 1)

                                    });        

        const correctData:
                {
                    course_id:number,
                    course_name:string,
                    assistant: {
                        id:number,
                        full_name:string,
                        phone_number:number,
                        role:UserRoles,
                        created_at:string
                    }
                }[]
        = findCourse.reduce(
            ( acc:any , item:any ) => {
                
            if(item.user)
                acc.push({
                    course_id:item.id,
                    course_name:item.name,
                    assistant: {
                        id:item.user.id,
                        full_name:item.user.full_name,
                        phone_number:item.user.phone_number,
                        role:item.user.role,
                        created_at:item.user.created_at
                    }
                })
                
                return acc
            } , []);
        
        const uniqueAssistants = [
                ...new Map(
                correctData.map(item => [
                    item.assistant.id,
                    item
                ])
        ).values()];
  
        return {
            success:true,
            data:uniqueAssistants.sort((a:any , b:any) => a.assistant.id - b.assistant.id )
        } 
   }

async getTeacherStudents(id: number, page: number, limit: number) {

    const findMentorProfile = await this.prisma.mentorProfile.findFirst({
        where: {
            user_id: id
        }
    });

    const findStudents = await this.prisma.courses.findMany({
        where: {
            mentor_id: findMentorProfile?.id
        },
        select: {
            studentCourses: {
                select: {
                    students: {
                        select: {
                            id: true,
                            full_name: true,
                            phone_number: true,
                            role: true,
                            created_at: true
                        }
                    }
                }
            }
        },
        take: limit,
        skip: limit * (page - 1)
    });

    // Получаем всех студентов из всех курсов
    const correctData = findStudents.flatMap((course) =>
        course.studentCourses
            .filter((studentCourse) => studentCourse.students !== null)
            .map((studentCourse) => ({
                id: studentCourse.students!.id,
                full_name: studentCourse.students!.full_name,
                phone_number: studentCourse.students!.phone_number,
                role: studentCourse.students!.role,
                created_at: studentCourse.students!.created_at
            }))
    );

    // Убираем дубликаты по student.id
    const uniqueStudents = [
        ...new Map(
            correctData.map((student) => [
                student.id,
                student
            ])
        ).values()
    ];

    // Сортировка по id
    uniqueStudents.sort(
        (a, b) => a.id - b.id
    );

    return {
        success: true,
        data: uniqueStudents
    };
}

   async getTeacherCourses(id:number , page:number , limit:number) {
    const mentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:id}});
    const getCourses = await this.prisma.courses.findMany({
        where: { mentor_id:mentorProfile!.id },
        select: {
            id:true,
            name:true,
            created_at:true
        },
        take:limit,
        skip:limit*(page - 1)
        
    });

    return {
        success:true,
        data:getCourses
    }
   }

   async getTeacherOneAssistant(user_id:number , id:number) {
        const mentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:user_id}});
        const getCourses = await this.prisma.courses.findMany({
            where: { mentor_id:mentorProfile!.id },
            select:{assistant_id:true}
        });

        const find = getCourses.find(
            (item:any) => {
                return item.assistant_id == id
            }
        )

        if(!find)
            throw new NotFoundException("assistant do not exist")

        const assistant = await this
                                .prisma
                                .users
                                .findUnique(
                                    {
                                        where:{id},
                                        select: {
                                            id:true,
                                            full_name:true,
                                            phone_number:true,
                                            courses:{
                                                select:{
                                                    id:true,
                                                    name:true
                                                }
                                            },
                                            created_at:true
                                        }
                                    });

        return {
            success:true,
            data:assistant
        }
   }

   async deleteTeacherAssistant( mentor_id:number , id:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentor_id}});
        const findCourse = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                user: {
                                                    select: {
                                                        id:true,
                                                        role:true
                                                    }
                                                }
                                            }

                                    });     

        const correctData:{id:number , role:string}[] = findCourse.reduce(
            ( acc:any , item:any ) => {
                
            if(item.user)
                acc.push({
                        id:item.user.id,
                        role:item.user.role
                })
                
                return acc
            } , []);
        
        
        const findUnique = correctData.find(
            (assistant:{id:number}) => {
                return assistant.id == id
            });

        if(!findUnique)
            throw new NotFoundException("assistant not found")

        await this.prisma.users.delete({where:{id}});

        return {
            success:true,
            message:"assistant deleted successfully"
        }
   }


   async createTeacherAssistant(id:number , payload:CreateAssistantDto) {
        const existUser = await this.prisma.users.findUnique({where:{phone_number:payload.phone_number}});

        if(existUser)
            throw new ConflictException("user already exists with this phone_number")
 

        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:id}});
        const findCourse = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                user: {
                                                    select: {
                                                        id:true
                                                   }
                                                }
                                            }

                                    });

        interface correctDataType { course_id:number , course_name:string , assistant: null | { id:number } };

        const correctData:correctDataType[] = findCourse.reduce(
            ( acc:any , item:any ) => {
                
                acc.push({
                    course_id:item.id,
                    course_name:item.name,
                    assistant: item.user ? { id:item.user.id } : null
                })
                
                return acc
            } , []);

        const findCourseAssistant = correctData.find(
            (course:any) => {
                return course.course_id == payload.courseId
            }
        );

        if(!findCourseAssistant) 
            throw new NotFoundException("course not found")
        
        if(findCourseAssistant.assistant)
            throw new ConflictException("course already has an assistant")

        const password = await hashing.HashingPassword(payload.password);
        const assistant = await this.prisma.users.create({
            data:{
                full_name:payload.full_name,
                phone_number:payload.phone_number,
                password,
                role:"ASSISTANT"
            }
        });

        await this
                .prisma
                .courses
                .update(
                    {
                        where:{
                            id:payload.courseId
                        },
                        data: {
                            assistant_id:assistant.id
                        }
                    });

        return {
            success:true,
            message:"assistant created successfully"
        }
   }

   async findTeacherAssistants(id:number , name:string) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:id}});
        const findCourse = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                user: {
                                                    where:{
                                                        full_name:{
                                                        startsWith:name.trim(), 
                                                        mode:"insensitive"},
                                                    },
                                                    select: {
                                                        id:true,
                                                        full_name:true,
                                                        phone_number:true,
                                                        role:true,
                                                        created_at:true
                                                    }
                                                }
                                            }
                                    });        

        const correctData = findCourse.reduce(
            ( acc:any , item:any ) => {
                
            if(item.user)
                acc.push({
                    course_id:item.id,
                    course_name:item.name,
                    assistant: {
                        id:item.user.id,
                        full_name:item.user.full_name,
                        phone_number:item.user.phone_number,
                        role:item.user.role,
                        created_at:item.user.created_at
                    }
                })
                
                return acc
            } , []);

        return {
            success:true,
            data:correctData
        }
   }

   async updateTeacherAssistant(user_id:number , payload:UpdateAssistantDto , assistantId:number) {
    const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id}});
    const findAssistants = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                user: {
                                                   select: {
                                                      id:true,
                                                      full_name:true
                                                   }
                                                }
                                            }
                                    });


    const correctData:{
        courseId:number,
        courseName:string,
        assistant:  {
            id:number,
            full_name:string
        } | null }[] = 
        
        findAssistants.reduce(
        (acc:any , item:any) => {
            acc.push({
                courseId:item.id,
                courseName:item.name,
                assistant: item.user ? {
                    id:item.user.id,
                    full_name:item.user.full_name
                } : null
            })
            
            return acc
        } , []);

    const correctUser = correctData.reduce(
        (acc:any , item:any) => {
            if(item.assistant)
                acc.push({ 
                    courseId:item.courseId,
                    courseName:item.courseName, 
                    assistant: {
                        id:item.assistant.id,
                        full_name:item.assistant.full_name
                    }
                })

            return acc

        } , [])
    
    const existAssistant = correctUser.find(
        (item:any) => {
            return item.assistant.id === assistantId
        }
    );

    if(!existAssistant)
        throw new NotFoundException("assistant not found")

    const existNumber = await this.prisma.users.findUnique({where:{phone_number:payload.phone_number}});

    if(existNumber)
        throw new ConflictException("user with this phone_number already exists")

    const existCourses = correctData.reduce(
        (acc:number ,  item:any) => {
            if(payload.courses.includes(item.courseId))
                acc += 1         
            return acc
        } , 0);

    if(existCourses !== payload.courses.length)
        throw new NotFoundException("One or more courses were not found")


    const matchAssistantCourses = correctData.reduce(
        (acc:any , item:any) => {
            if( item.assistant && item.assistant.id == assistantId ) {
                acc.push({
                    courseId:item.courseId,
                    courseName:item.courseName,
                    assistant:  {
                        id:item.assistant.id,
                        full_name:item.assistant.full_name
                    }
                })
            } else if( !item.assistant) {
                acc.push({
                    courseId:item.courseId,
                    courseName:item.courseName,
                    assistant:item.assistant
                })
            }

            return  acc
        } , []);

    const existProperCourses = matchAssistantCourses.reduce(
        (acc:number , item:any) => {
            if( payload.courses.includes(item.courseId) )
                acc += 1

            return acc
        } , 0)
    
    if(existProperCourses !== payload.courses.length )
        throw new ConflictException("one or more courses already has an assistant")

    await Promise.all([
    this.prisma.courses.updateMany({where:{assistant_id:assistantId} , data:{assistant_id:null}}),
    this.prisma.courses.updateMany(
        {
            where:{
                id:{
                    in:payload.courses
                }
            } , 
            data:{
                assistant_id:assistantId
            }
        })
        ])

    return {
            success:true,
            message:"assistant updated successfully"
        }
   }

async deleteTeacherStudent(
    teacher_id: number,
    studentId: number
) {

    const findMentorProfile = await this.prisma.mentorProfile.findFirst({
        where: {
            user_id: teacher_id
        }
    });

    if (!findMentorProfile) {
        throw new NotFoundException("mentor not found");
    }

    const findStudents = await this.prisma.courses.findMany({
        where: {
            mentor_id: findMentorProfile.id
        },
        select: {
            studentCourses: {
                select: {
                    students: {
                        select: {
                            id: true,
                            full_name: true,
                            phone_number: true,
                            role: true,
                            created_at: true
                        }
                    }
                }
            }
        }
    });

    // Получаем всех студентов всех курсов ментора
    const correctData = findStudents.flatMap((course) =>
        course.studentCourses
            .filter((studentCourse) => studentCourse.students !== null)
            .map((studentCourse) => ({
                id: studentCourse.students!.id,
                full_name: studentCourse.students!.full_name,
                phone_number: studentCourse.students!.phone_number,
                role: studentCourse.students!.role,
                created_at: studentCourse.students!.created_at
            }))
    );

    // Убираем дубликаты по student.id
    const uniqueStudents = [
        ...new Map(
            correctData.map((student) => [
                student.id,
                student
            ])
        ).values()
    ];

    const existStudent = uniqueStudents.find(
        (student) => student.id === studentId
    );

    if (!existStudent) {
        throw new NotFoundException("student not found");
    }

    await this.prisma.studentCourse.deleteMany({
        where: {
            studentId: existStudent.id
        }
    });

    await this.prisma.users.delete({
        where: {
            id: existStudent.id
        }
    });

    return {
        success: true,
        message: "student deleted successfully"
    };
}


async findTeacherStudents(teacher_id:number ,  name:string) {
    const findMentorProfile = await this.prisma.mentorProfile.findFirst({
        where: {
            user_id: teacher_id
        }
    });

    const findStudents = await this.prisma.courses.findMany({
        where: {
            mentor_id: findMentorProfile!.id
        },
        select: {
            studentCourses: {
                select: {
                    students: {
                        where:{
                            full_name: {
                                startsWith:name.trim(),
                                mode:"insensitive"
                            }
                        },
                        select: {
                            id: true,
                            full_name: true,
                            phone_number: true,
                            role: true,
                            created_at:true
                        }
                    }
                }
            }
        }
    });

    // Получаем всех студентов всех курсов ментора
    const correctData = findStudents.flatMap((course) =>
        course.studentCourses
            .filter((studentCourse) => studentCourse.students !== null)
            .map((studentCourse) => ({
                id: studentCourse.students!.id,
                full_name: studentCourse.students!.full_name,
                phone_number: studentCourse.students!.phone_number,
                role: studentCourse.students!.role,
                created_at: studentCourse.students!.created_at
            }))
    );

    // Убираем дубликаты по student.id
    const uniqueStudents = [
        ...new Map(
            correctData.map((student) => [
                student.id,
                student
            ])
        ).values()
    ];

    return {
        success:true,
        data:uniqueStudents
    }
    }
    
    async getTeacherOneStudent(teacher_id:number , studentId:number) {
    const findMentorProfile = await this.prisma.mentorProfile.findFirst({
        where: {
            user_id: teacher_id
        }
    });

    if (!findMentorProfile) {
        throw new NotFoundException("mentor not found");
    }

    const findStudents = await this.prisma.courses.findMany({
        where: {
            mentor_id: findMentorProfile.id
        },
        select: {
            studentCourses: {
                select: {
                    students: {
                        select: {
                            id: true,
                            full_name: true,
                            phone_number: true,
                            role: true,
                            created_at: true,
                        }
                    }
                }
            }
        }
    });

    // Получаем всех студентов всех курсов ментора
    const correctData = findStudents.flatMap((course) =>
        course.studentCourses
            .filter((studentCourse) => studentCourse.students !== null)
            .map((studentCourse) => ({
                id: studentCourse.students!.id,
                full_name: studentCourse.students!.full_name,
                phone_number: studentCourse.students!.phone_number,
                role: studentCourse.students!.role,
                created_at: studentCourse.students!.created_at
            }))
    );

    // Убираем дубликаты по student.id
    const uniqueStudents = [
        ...new Map(
            correctData.map((student) => [
                student.id,
                student
            ])
        ).values()
    ];

    const existStudent = uniqueStudents.find(
        (student) => student.id === studentId
    );

    if (!existStudent)
        throw new NotFoundException("student not found");
    
    const courseCount = await this.prisma.studentCourse.count({
        where: {
            studentId: existStudent.id
        }
    });

    return {
        success: true,
        data: {
            ...existStudent,
            course_count: courseCount
        }
    };
    }

    async updateTeacherStudent(
    teacher_id: number,
    payload: UpdateStudentDto,
    studentId: number
) {
    // 1. Находим профиль ментора
    const findMentorProfile = await this.prisma.mentorProfile.findFirst({
        where: {
            user_id: teacher_id
        }
    });

    if (!findMentorProfile) {
        throw new NotFoundException("mentor not found");
    }

    // 2. Проверяем, существует ли студент у этого ментора
    const existStudent = await this.prisma.studentCourse.findFirst({
        where: {
            studentId: studentId,
            courses: {
                mentor_id: findMentorProfile.id
            }
        }
    });

    if (!existStudent) {
        throw new NotFoundException("student not found");
    }

    // 3. Проверяем phone_number
    if (payload.phone_number) {
        const existPhone = await this.prisma.users.findFirst({
            where: {
                phone_number: payload.phone_number,
                NOT: {
                    id: studentId
                }
            }
        });

        if (existPhone) {
            throw new ConflictException(
                "This phone number already exists"
            );
        }
    }

    // 4. Если courses переданы
    if (payload.courses) {

        // Убираем дубликаты из массива courses
        const uniqueCourseIds = [
            ...new Set(payload.courses)
        ];

        // 5. Проверяем, что все курсы существуют
        // и принадлежат этому ментору
        const existCourses = await this.prisma.courses.findMany({
            where: {
                id: {
                    in: uniqueCourseIds
                },
                mentor_id: findMentorProfile.id
            },
            select: {
                id: true
            }
        });

        if (existCourses.length !== uniqueCourseIds.length) {
            throw new NotFoundException(
                "One or more courses not found"
            );
        }

        // 6. Обновляем всё атомарно
        await this.prisma.$transaction(async (tx) => {

            // Обновляем данные студента
            await tx.users.update({
                where: {
                    id: studentId
                },
                data: {
                    ...(payload.full_name !== undefined && {
                        full_name: payload.full_name
                    }),

                    ...(payload.phone_number !== undefined && {
                        phone_number: payload.phone_number
                    })
                }
            });

            // Удаляем студента из старых курсов
            await tx.studentCourse.deleteMany({
                where: {
                    studentId: studentId
                }
            });

            // Добавляем студента в новые курсы
            await tx.studentCourse.createMany({
                data: uniqueCourseIds.map((courseId) => ({
                    studentId: studentId,
                    courseId: courseId
                }))
            });
        });

    } else {

        // 7. Если courses не передали,
        // обновляем только данные студента
        await this.prisma.users.update({
            where: {
                id: studentId
            },
            data: {
                ...(payload.full_name !== undefined && {
                    full_name: payload.full_name
                }),

                ...(payload.phone_number !== undefined && {
                    phone_number: payload.phone_number
                })
            }
        });
    }

    return {
        success: true,
        message: "student updated successfully"
    };
}

    async getTeachersCourses(mentorId:number , page:number , limit:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentorId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id
                                            },
                                            select:{
                                                id:true,
                                                name:true,
                                                sections:true,
                                                level:true,
                                                prize:true,
                                                category:true,
                                                created_at:true,
                                                updated_at:true
                                            },

                                                take:limit,
                                                skip:limit*(page - 1)
                                            
                                        });

        return {
            success:true,
            data:findCourses
        }
    }

    async findTeacherCourse(teacherId:number , name:string) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:teacherId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id,
                                                name:{
                                                    startsWith:name,
                                                    mode:"insensitive"
                                                }
                                            },
                                            select:{
                                                id:true,
                                                name:true,
                                                sections:true,
                                                level:true,
                                                prize:true,
                                                category:true,
                                                created_at:true,
                                                updated_at:true
                                            }    
                                        });

        return {
            success:true,
            data:findCourses
        }
    }

    async deleteTeacherOneCourse(mentorId:number , courseId:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentorId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findFirst(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id,
                                                id:courseId
                                            }    
                                        });
        
        if(!findCourses)
            throw new NotFoundException("course not found")

        await Promise.all(
        [    
            this.prisma.studentCourse.deleteMany({where:{courseId:findCourses.id}}),
            this.prisma.courses.delete({where:{id:findCourses.id}})
        ]);

        return {
            success:true,
            message:"course deleted successfully"
        }
    }

    async getTeacherOneCourse(mentorId:number , courseId:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentorId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findFirst(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id,
                                                id:courseId
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                banner:true,
                                                prize:true,
                                                level:true,
                                                created_at:true,
                                                updated_at:true,
                                                assistant_id:true,
                                                category:true
                                            }
                                        });
 
        if(!findCourses)
            throw new NotFoundException("course not found")

        const findAssistant = findCourses?.assistant_id ? await this.prisma.users.findUnique({where:{id:findCourses?.assistant_id}}) : null;
        const findTeacher = await this.prisma.users.findUnique({where:{id:mentorId}});
                                        
        const properData = {
                id:findCourses?.id,
                name:findCourses?.name,
                banner:findCourses?.banner,
                prize:findCourses?.prize,
                level:findCourses?.level,
                assistant:findAssistant?.full_name,
                teacher:findTeacher?.full_name,
                category:findCourses?.category,
                created_at:findCourses?.created_at,
                update_at:findCourses?.updated_at
        }

        return {
            success:true,
            data: properData
        }
    }

    async addAssistantToMentorCourse(mentorId:number , courseId:number  , assistantId:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentorId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findFirst(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id,
                                                id:courseId
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                banner:true,
                                                prize:true,
                                                level:true,
                                                created_at:true,
                                                updated_at:true,
                                                assistant_id:true,
                                                category:true
                                            }
                                        });
 
        if(!findCourses)
            throw new NotFoundException("course not found")

           const findCourse = await this
                                    .prisma
                                    .courses
                                    .findMany(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile!.id
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                user: {
                                                    select: {
                                                        id:true,
                                                        full_name:true,
                                                        phone_number:true,
                                                        role:true,
                                                        created_at:true
                                                    }
                                                }
                                            }

                                    });        

        const correctData:
                {
                    course_id:number,
                    course_name:string,
                    assistant: {
                        id:number,
                        full_name:string,
                        phone_number:number,
                        role:UserRoles,
                        created_at:string
                    }
                }[]
        = findCourse.reduce(
            ( acc:any , item:any ) => {
                
            if(item.user)
                acc.push({
                    course_id:item.id,
                    course_name:item.name,
                    assistant: {
                        id:item.user.id,
                        full_name:item.user.full_name,
                        phone_number:item.user.phone_number,
                        role:item.user.role,
                        created_at:item.user.created_at
                    }
                })
                
                return acc
            } , []);
        
        const uniqueAssistants = [
                ...new Map(
                correctData.map(item => [
                    item.assistant.id,
                    item
                ])
        ).values()];

        const filter = uniqueAssistants.find(
            (user:any) => user.assistant.id == assistantId
        );

        if(!filter)
            throw new NotFoundException("assistant not found")

        if(findCourses.assistant_id)
            throw new ConflictException("course already has an assistant")

        await this.prisma.courses.update({where:{id:courseId} , data:{assistant_id:assistantId}});

        return {
            success:true,
            message:"assistant added to course"
        }
    }


    async deleteAssistantToMentorCourse(mentorId:number , courseId:number  , assistantId:number) {
        const findMentorProfile = await this.prisma.mentorProfile.findFirst({where:{user_id:mentorId}});
        const findCourses = await this
                                    .prisma
                                    .courses
                                    .findFirst(
                                        {
                                            where:{
                                                mentor_id:findMentorProfile?.id,
                                                id:courseId
                                            },
                                            select: {
                                                id:true,
                                                name:true,
                                                banner:true,
                                                prize:true,
                                                level:true,
                                                created_at:true,
                                                updated_at:true,
                                                assistant_id:true,
                                                category:true
                                            }
                                        });
 
        if(!findCourses)
            throw new NotFoundException("course not found")

        if( findCourses.assistant_id !== assistantId )
            throw new ConflictException("assistant do not exists in this course")

        await this.prisma.courses.update({where:{id:courseId} , data:{assistant_id:null}})

        return {
            success:true,
            message:"assistant successfully removed from this course"
        }
    }
}