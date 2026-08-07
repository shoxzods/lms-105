# Используем Node.js
FROM node:22-alpine

# Рабочая папка внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

RUN npx prisma generate

# Собираем проект
RUN npm run build

# Открываем порт NestJS
EXPOSE 3300

# Запускаем приложение
CMD ["npm", "run", "start:prod"]