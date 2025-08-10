FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate || true
COPY src ./src
COPY tsconfig.json .
RUN npm run build
EXPOSE 4000
CMD ["npm","run","start"]
