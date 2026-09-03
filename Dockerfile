FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Multer papkalarni o'zi yaratmaydi — oldindan tayyorlab qo'yamiz
RUN mkdir -p src/uploads/images src/uploads/videos src/uploads/files

EXPOSE 3000

# Migratsiyalar har ishga tushishda qo‘llanadi, keyin server ko‘tariladi
CMD ["sh","-c","npx prisma migrate deploy && npm run start:prod"]
