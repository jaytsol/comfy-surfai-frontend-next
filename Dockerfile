# 1단계: 빌드 환경 (Builder)
# 백엔드와 동일한 안정적인 Node.js LTS 버전을 사용합니다.
FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# Next.js 앱을 프로덕션용으로 빌드합니다.
# 이 Dockerfile이 제대로 동작하려면 next.config.js에 'output: "standalone"' 설정이 필요합니다.
RUN npm run build

# 2단계: 최종 실행 환경 (Runner)
FROM node:22-alpine

WORKDIR /app

# 운영 환경임을 명시합니다.
ENV NODE_ENV=production
# Next.js의 원격 측정 데이터 수집을 비활성화합니다.
ENV NEXT_TELEMETRY_DISABLED 1

# 빌드 환경에서 생성된 독립 실행(standalone)에 필요한 최소한의 파일만 복사합니다.
# COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 프론트엔드 포트를 4000번으로 설정합니다. (원하는 경우 변경 가능)
EXPOSE 4000
ENV PORT 4000

# Next.js 앱 실행 명령어 (server.js는 standalone 빌드 시 자동으로 생성됨)
CMD ["node", "server.js"]
