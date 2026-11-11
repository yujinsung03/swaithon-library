# swaithon-library

SWAITHON 대회 프로젝트 (팀 도서관 뒷자리). 이주민의 한국어 소통을 돕는 AI 서비스입니다.
기능: Speak(말하기) · Listen(듣기) · Learn(피드백 도감) · Writing(쓰기)

## 폴더 구조

```
swaithon-library/
├── frontend/   React + TypeScript + Vite 앱
├── backend/    FastAPI 서버 (예정)
└── supabase/   DB 스키마 (schema.sql)
```

## 프론트엔드 실행

Node.js가 필요합니다.

```bash
cd frontend
npm install
npm run dev
```

http://localhost:5173 에서 열립니다.

### 환경변수

`frontend/.env.example`을 `frontend/.env.local`로 복사하고 값을 채웁니다. `.env.local`은 git에 올라가지 않습니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- Supabase 화면에서 복사하면 `NEXT_PUBLIC_`으로 나오는데, 반드시 `VITE_`로 바꿔야 합니다.
- 값이 없으면 피드백 도감이 브라우저(localStorage)에 저장됩니다.
- `secret` · `service_role` 키는 절대 넣지 마세요.

## Supabase

`supabase/schema.sql`은 이미 프로젝트에 실행해 둔 상태입니다. 테이블을 바꿀 때만 SQL Editor에서 다시 실행하세요.
