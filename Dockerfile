# Install dependencies only when needed
FROM node:20.11.1-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN apk update && \
    apk add git
RUN yarn install

# Rebuild the source code only when needed
FROM node:20.11.1-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run next
FROM node:20.11.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "start"]
