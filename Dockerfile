# 1단계: 빌드 환경 (Builder)
# Node.js 버전을 백엔드와 동일하게 22.x LTS 버전으로 변경합니다.
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# Next.js 앱을 프로덕션용으로 빌드합니다.
# 'output: "standalone"' 설정이 next.config.js에 필요합니다.
RUN npm run build

# 2단계: 실행 환경 (Runner)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Next.js 13.4부터는 기본적으로 비활성화 되어있으므로, 명시적으로 비활성화합니다.
ENV NEXT_TELEMETRY_DISABLED 1

# 빌드 환경에서 생성된 독립 실행(standalone)에 필요한 최소한의 파일만 복사합니다.
# 이를 통해 최종 이미지의 보안과 성능을 향상시킬 수 있습니다.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4000번 포트를 외부에 노출시킵니다. (프론트엔드 포트)
EXPOSE 4000

# 앱 실행 명령어 (server.js는 standalone 빌드 시 자동으로 생성됩니다)
CMD ["node", "server.js"]
