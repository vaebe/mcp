FROM node:22.12-alpine AS builder

# Must be entire project because `prepare` script is run during `npm install` and requires all files.
COPY packages/github-search /app
COPY tsconfig.json /tsconfig.json

WORKDIR /app

# 执行安装命令的时候会自动执行 build 命令
RUN --mount=type=cache,target=/root/.npm npm install

FROM node:22.12-alpine AS release

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

WORKDIR /app

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "dist/index.js"]