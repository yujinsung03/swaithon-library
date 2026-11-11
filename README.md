# swaithon-library

SWAITHON 대회 프로젝트 (팀 도서관 뒷자리). 이주민의 한국어 소통을 돕는 AI 서비스입니다.
기능: Speak(말하기) · Listen(듣기) · Learn(피드백 도감) · Writing(쓰기)

## 폴더 구조

```
swaithon-library/
├── frontend/   React + TypeScript + Vite 앱
├── backend/    FastAPI + Google Gemini API 서버
└── supabase/   DB 스키마 (schema.sql)
```

## 처음 한 번만 준비

필요한 것: **Node.js**, **Python 3.10 이상**, **Chrome**(음성 인식용)

### 1. Gemini API 키 받기 (무료)

1. [Google AI Studio](https://aistudio.google.com)에 Google 계정으로 로그인합니다.
2. **Get API key** → **Create API key**를 누릅니다.
3. 만들어진 키를 복사합니다.

- 키는 비밀번호와 같습니다. 단톡방, 코드, git에 올리지 마세요.
- **팀원마다 각자 발급받으세요.** 무료 한도가 키마다 따로라서, 하나를 같이 쓰면 금방 막힙니다(모델별로 하루 20번 정도).

### 2. 키를 백엔드에 넣기

`backend/.env.example`을 복사해서 `backend/.env`를 만들고, 첫 줄에 키를 붙여넣습니다.

```
GEMINI_API_KEY=여기에_복사한_키
```

나머지 줄은 비워 둬도 됩니다. `backend/.env`는 git에 올라가지 않습니다.

### 3. 프론트엔드 환경변수

`frontend/.env.example`을 복사해서 `frontend/.env.local`을 만들고 값을 채웁니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_BASE_URL=http://localhost:8000
```

- Supabase 값은 단톡방에 공유된 것을 쓰거나, Supabase 프로젝트의 **Connect** 버튼에서 복사합니다.
- Supabase 화면에서 복사하면 `NEXT_PUBLIC_`으로 나오는데, 반드시 `VITE_`로 바꿔야 합니다.
- `secret` · `service_role` 키는 절대 넣지 마세요.
- Supabase 값이 없으면 피드백 도감이 브라우저에만 저장되고, `VITE_API_BASE_URL`이 없으면 AI 대신 목업 답변이 나옵니다.

### 4. 설치

```bash
# 프로젝트 루트에서
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

cd frontend
npm install
```

## 실행

터미널 두 개를 열어 각각 실행합니다.

```bash
# 터미널 1: 백엔드 (http://localhost:8000)
cd backend
../.venv/bin/uvicorn app.main:app --reload --port 8000 --timeout-graceful-shutdown 2
```

```bash
# 터미널 2: 프론트엔드 (http://localhost:5173)
cd frontend
npm run dev
```

Chrome에서 http://localhost:5173 을 열고, 마이크 권한을 물으면 **허용**하세요.

### 잘 안 될 때

| 증상 | 확인할 것 |
|---|---|
| Speak/Listen에서 `Failed to fetch` | 백엔드(터미널 1)가 켜져 있는지 |
| 백엔드 터미널에 `Waiting for connections to close`가 뜨고 멈춤 | 실행 명령에 `--timeout-graceful-shutdown 2`가 있는지. 없으면 Ctrl+C로 끄고 위 명령으로 다시 실행 |
| `GEMINI_API_KEY is not set` | `backend/.env`에 키를 넣었는지. 넣은 뒤 백엔드를 다시 켜기 |
| `The free AI quota is used up` | 오늘 무료 한도를 다 씀. 내일 다시 하거나 다른 키 사용 |
| 마이크 버튼이 반응 없음 | Chrome인지, 주소창에서 마이크를 허용했는지 |
| LEARN에 `Saved on this device only` | `frontend/.env.local`의 Supabase 값과 `VITE_` 이름 확인 후 `npm run dev` 다시 실행 |

백엔드 상태는 http://localhost:8000/health 에서 볼 수 있습니다(`"hasApiKey": true`면 키가 들어간 것).

## Supabase

`supabase/schema.sql`은 이미 프로젝트에 실행해 둔 상태입니다. 테이블을 바꿀 때만 SQL Editor에서 다시 실행하세요.

## 더 보기

- 백엔드 엔드포인트와 프롬프트 수정 방법: [backend/README.md](backend/README.md)
