# swaithon-library

SWAITHON 대회 프로젝트 (팀 **도서관 뒷자리**).
한국에 사는 이주민이 서툰 한국어나 여러 언어를 섞어 말해도, 상대와의 관계에 맞는 자연스러운 한국어로 바꿔 주고, 그 과정을 학습으로 이어 주는 AI 한국어 소통 도우미입니다.

## 목차

- [기능](#기능)
- [화면과 언어](#화면과-언어)
- [어떻게 동작하나요](#어떻게-동작하나요)
- [폴더 구조](#폴더-구조)
- [처음 한 번만 준비](#처음-한-번만-준비)
- [실행 (macOS)](#실행-macos)
- [Windows에서 실행하기](#windows에서-실행하기)
- [잘 안 될 때](#잘-안-될-때)
- [Supabase](#supabase)

## 기능

### Speak: 내 말을 자연스러운 한국어로

1. 상대를 고릅니다: **친구·동생 / 윗사람**, **처음 봄 / 조금 앎 / 친함**
2. 마이크로 말하거나 입력합니다. 한국어, 모국어, 섞인 말 모두 됩니다.
   - 예: `나는 먹고 싶어 pizza`, `내일 친구랑 映画を見に行きます`
3. **"Is this what you're trying to say?"** 화면에서 뜻을 확인합니다.
   - 확인 문장은 한국어를 뺀 내 주 언어로 나옵니다.
     - `나는 먹고 싶어 pizza` → `I want to eat pizza.`
     - 일본어를 섞어 말하면 → 일본어 문장
   - 한국어로만 말했다면 앱 언어로 나옵니다.
   - 아래 **You said** 줄에는 내가 말한 그대로 나옵니다.
4. **YES**를 누르면 관계에 맞는 입말 한국어와 **바뀐 부분 및 이유**가 나옵니다.
   - 결과는 "~요"(해요체) 또는 반말로 나옵니다. 실제 대화에서 잘 쓰지 않는 "~습니다/~다"는 쓰지 않습니다.
   - 🔊 버튼으로 발음을 들을 수 있습니다.
   - 피드백 도감에 저장할 수 있습니다.

### Listen: 한국 사람의 말을 이해하기

1. 마이크를 누르고 상대가 말하게 합니다. Listen의 녹음·확인 화면은 한국 사람이 보도록 **한국어로** 되어 있습니다.
2. AI가 녹음을 받아씁니다. 띄어쓰기를 맞추고, 질문이면 `?`를 붙입니다. "이게 맞나요?"에서 확인합니다.
3. 결과 화면에서 다음을 보여 줍니다.
   - **실제 의미 번역**
   - **관용 표현·문화 설명**. 예: "콩나물국이 시원하다"는 차갑다는 뜻이 아니라, 국물이 개운하고 속이 편하다는 뜻
4. 결과는 피드백 도감에 자동으로 저장됩니다.

### Learn: 피드백 도감

- Speak와 Listen에서 저장한 문장을 카드로 모아 봅니다. 카드를 누르면 교정 이유와 표현 설명이 펼쳐집니다.
- **검색**
  - 카드의 한국어 문장과 뜻, 두 줄에서 찾습니다.
  - 다른 언어로 검색해도 됩니다. 예: `ピザ`, `study`로 검색해도 `피자`, `공부` 카드가 나옵니다. AI가 같은 뜻의 단어를 찾아 함께 검색합니다.
- **★ 중요 표시**: 별표한 카드는 붉은색으로 바뀌고, "중요" 필터로 모아 볼 수 있습니다.
- **🔊 발음 듣기**: 발음 공부용으로 0.9배 속도로 읽어 줍니다.
- 메모 추가, 삭제

### Write: 상황별 메시지 쓰기

- 상황을 고르고, 받는 사람과 하고 싶은 말을 적습니다. 어떤 언어로 써도 됩니다.
  - 상황: 교수님께 이메일, 동료에게 메시지, 식당 문의, 약속 거절·변경, 기타
- 한국식 형식에 맞춘 제목과 메시지를 **쓰는 대로 실시간으로** 보여 줍니다.
- 이름이나 학번처럼 AI가 모르는 정보는 `[이름]`처럼 비워 둡니다.
- 번역, 쓸 만한 표현 설명, 복사 버튼이 있습니다.

## 화면과 언어

- 메뉴바 가운데의 🌐 버튼에서 **앱 언어**를 고릅니다: English, 日本語, 简体中文, Tiếng Việt, ไทย, Русский
- 메뉴, 안내 문구, AI가 쓰는 설명(교정 이유, 번역, 표현 설명)이 모두 그 언어로 바뀝니다.
- 결과 한국어와 Listen의 한국어 화면은 그대로입니다.
- 고른 언어는 브라우저에 저장됩니다. 처음에는 브라우저 언어를 따라갑니다.
- 언어를 더 추가하려면:
  - [frontend/src/i18n/strings.ts](frontend/src/i18n/strings.ts)에 그 언어의 문구를 넣습니다.
  - 백엔드 `schemas.py`의 `Language`와 `prompts.py`의 `LANGUAGE_NAMES`에 한 줄씩 넣습니다.

## 어떻게 동작하나요

```
브라우저 (React)  ──►  백엔드 (FastAPI)  ──►  AI (GPT / Gemini)
      │
      └──►  Supabase (피드백 도감 저장)
```

| 단계 | 하는 일 | 기본 모델 |
|---|---|---|
| 음성 받아쓰기 (Speak, Listen) | 녹음 파일 → 글자. 섞인 언어도 원래 글자로 | `backend/.env` 설정에 따라 gemini-3.5-flash-lite 또는 gpt-audio-1.5 |
| 뜻 확인, 교정, 번역, 설명, 메시지 작성 | 지시문(프롬프트)과 정해진 JSON 형식으로 요청 | gpt-6.1-sol |
| 실패하면 | 다음 모델로 자동으로 넘어감 (한도 초과, 서버 오류 등) | `.env`에 적은 순서대로 |

- AI에게 주는 지시문은 전부 [backend/app/prompts.py](backend/app/prompts.py)에 있습니다. **답변 품질은 이 파일에서 다듬습니다.**
- 녹음하는 동안 브라우저 자체 음성 인식도 같이 돌아갑니다. 이 결과는 화면에 보이지 않고, AI에 참고로 보내거나 AI가 실패했을 때 대신 씁니다.
- 피드백 도감은 Supabase **익명 계정**에 저장됩니다. 로그인 화면이 없어도 브라우저마다 각자의 기록이 생기고, 다른 사람은 볼 수 없습니다. 브라우저 데이터를 지우면 새 계정이 됩니다.

## 폴더 구조

```
swaithon-library/
├── frontend/                 React 19 + TypeScript + Vite
│   └── src/
│       ├── components/       화면 (speak*, listen*, learnMain, writingMain, languageDialog)
│       ├── api/              백엔드 호출 (client.ts), 요청·응답 형식 (types.ts), 목업 (mock.ts)
│       ├── i18n/             앱 언어 설정과 6개 언어 문구
│       ├── hooks/            녹음, 브라우저 음성 인식
│       ├── store/            피드백 도감 (Supabase / localStorage)
│       ├── utils/            WAV 변환, 발음 재생, 도감 검색, 스트리밍 JSON 읽기
│       └── lib/supabase.ts   Supabase 연결, 익명 로그인
├── backend/                  FastAPI 서버 → 자세한 내용은 backend/README.md
│   └── app/
│       ├── main.py           엔드포인트
│       ├── prompts.py        AI 지시문
│       ├── llm.py            GPT·Gemini 호출, 모델 대체
│       └── schemas.py        요청·응답 형식
└── supabase/schema.sql       피드백 도감 테이블과 보안 규칙
```

## 처음 한 번만 준비

필요한 것: **Node.js**, **Python 3.10 이상**, **Chrome**(마이크용)

> **Windows를 쓰나요?** 1~4번(키, Supabase, 환경변수)은 똑같이 하고, 설치부터는 [Windows에서 실행하기](#windows에서-실행하기)를 따라 하세요.

### 1. AI API 키 받기

각자 자기 키를 받아서 씁니다. 둘 중 하나만 있어도 되고, 둘 다 있으면 더 안정적입니다.

| 키 | 받는 곳 | 특징 |
|---|---|---|
| **Gemini API 키** | [Google AI Studio](https://aistudio.google.com) → **Get API key** → **Create API key** | 무료로 시작할 수 있습니다. 무료 한도는 모델마다 하루 20번 정도입니다. 음성 받아쓰기(섞인 언어 포함)가 가장 정확했습니다 |
| **OpenAI 호환 API 키** | [OpenAI](https://platform.openai.com/api-keys), 또는 OpenAI 방식으로 여러 회사 모델을 제공하는 서비스 | 유료(쓴 만큼 결제)이고 하루 한도가 없습니다. 교정·번역·설명 같은 글 작업에 씁니다 |

키는 비밀번호와 같습니다. 코드, README, git에 절대 올리지 마세요.

### 2. 백엔드 환경변수 (`backend/.env`)

`backend/.env.example`을 복사해서 `backend/.env`를 만들고, 가진 키에 맞는 설정 하나를 고릅니다. `backend/.env`는 git에 올라가지 않습니다.

**A. Gemini 키만 (가장 간단, 무료)**

```
GEMINI_API_KEY=내_Gemini_키
```

무료 한도를 다 쓰면 다음 Gemini 모델로 자동으로 넘어갑니다. 모든 모델의 한도를 다 쓰면 다음 날까지 기다려야 합니다.

**B. OpenAI 키 + Gemini 키 (추천)**: 글 작업은 GPT, 음성 받아쓰기는 Gemini가 맡습니다.

```
AI_GATEWAY_API_KEY=내_OpenAI_키
GEMINI_API_KEY=내_Gemini_키
GEMINI_AUDIO_MODELS=gemini-3.5-flash-lite,gemini-3.8-flash
```

**C. OpenAI 호환 서비스 하나로**: OpenAI가 아닌 서비스를 쓰면 그 서비스의 주소와 모델 이름을 적습니다.

```
AI_GATEWAY_API_KEY=서비스_키
AI_GATEWAY_BASE_URL=https://서비스_주소/v1
AI_GATEWAY_MODELS=서비스에서_쓰는_모델_이름
AI_GATEWAY_AUDIO_MODELS=음성을_받는_모델_이름
```

그 서비스가 Gemini API 형식도 제공하면 `GEMINI_API_KEY`에 같은 키를, `GEMINI_BASE_URL`에 그 주소를 넣어 음성 받아쓰기를 Gemini로 할 수 있습니다.

- 모델 이름은 서비스마다 다릅니다. 기본값은 글 작업 `gpt-6.1-sol`, 음성 `gemini-3.8-flash`입니다.
- 여러 모델을 쉼표로 적으면 앞에서부터 쓰고, 실패하면 다음 모델로 넘어갑니다.
- 나머지 설정은 [`backend/.env.example`](backend/.env.example)의 설명을 보세요.

### 3. Supabase 준비 (피드백 도감 저장, 선택)

Supabase를 쓰지 않으면 피드백 도감은 이 브라우저(localStorage)에만 저장됩니다. 기기가 바뀌어도 기록을 남기고 싶다면 무료 Supabase 프로젝트를 만듭니다.

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. **SQL Editor**에 [`supabase/schema.sql`](supabase/schema.sql)을 붙여넣고 **Run**을 누릅니다. 피드백 도감 테이블과 "자기 기록만 보기" 보안 규칙이 만들어집니다.
3. **Authentication → Sign In / Providers**에서 **Allow anonymous sign-ins**를 켭니다. 로그인 화면 없이 브라우저마다 익명 계정을 만들기 위해서입니다.
4. **Connect** 버튼(또는 Project Settings → API)에서 **Project URL**과 **publishable key**(`sb_publishable_...`)를 복사해 둡니다.

### 4. 프론트엔드 환경변수 (`frontend/.env.local`)

`frontend/.env.example`을 복사해서 `frontend/.env.local`을 만듭니다.

```
VITE_SUPABASE_URL=https://내_프로젝트.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_BASE_URL=http://localhost:8000
```

- Supabase 화면에서 복사하면 이름이 `NEXT_PUBLIC_`으로 시작하는데, 반드시 `VITE_`로 바꿔야 합니다.
- `secret` · `service_role` 키는 절대 넣지 마세요. 브라우저에 그대로 노출됩니다.
- Supabase를 쓰지 않으면 위의 두 줄은 비워 둡니다.
- `VITE_API_BASE_URL`이 없으면 AI 대신 목업 답변이 나옵니다.

### 5. 설치 (macOS)

```bash
# 프로젝트 루트에서
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

cd frontend
npm install
```

`git pull`로 새 버전을 받은 뒤에는 이 설치를 한 번 더 해 주세요. 새 패키지가 추가됐을 수 있습니다.

## 실행 (macOS)

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

- 백엔드 상태: http://localhost:8000/health
  - `models`: 쓰는 모델 순서
  - `hasGatewayKey`, `hasGeminiKey`: 키가 들어갔는지
- API를 직접 호출해 보기: http://localhost:8000/docs

## Windows에서 실행하기

Windows 10/11 기준입니다. 명령은 **PowerShell**에 입력합니다(VS Code 터미널의 기본값도 PowerShell). macOS와 다른 점은 주로 **경로 구분자(`\`)**와 **`.venv\Scripts`** 폴더 이름입니다.

### 0단계. 프로그램 설치 (처음 한 번)

| 프로그램 | 받는 곳 | 설치할 때 주의 |
|---|---|---|
| **Git** | https://git-scm.com/download/win | 옵션은 전부 기본값으로 Next |
| **Node.js (LTS)** | https://nodejs.org | LTS 버전을 받아 기본값으로 설치 |
| **Python 3.10 이상** | https://www.python.org/downloads/ | ⚠️ 설치 첫 화면 아래의 **"Add python.exe to PATH"를 반드시 체크** |
| **VS Code** | https://code.visualstudio.com | `.env` 파일을 만들 때 씁니다 |
| **Chrome** | https://www.google.com/chrome | 마이크는 Chrome·Edge에서 됩니다 |

설치가 끝나면 **열려 있던 터미널과 VS Code를 모두 닫았다가 다시 여세요.** 그래야 새로 설치한 프로그램을 찾습니다.

제대로 설치됐는지 확인합니다. 숫자(버전)가 나오면 성공입니다.

```powershell
git --version
node --version
npm --version
py --version
```

- `py`가 없다고 나오면 `python --version`으로 해 보세요. 둘 중 되는 쪽을 아래에서 계속 쓰면 됩니다.
- `python`을 입력했는데 **Microsoft Store가 열리면** Python이 PATH에 안 들어간 것입니다.
  - Python 설치 파일을 다시 실행해 **Modify** → **Add Python to environment variables**를 체크하세요.
  - 또는 Windows 설정 → **앱** → **고급 앱 설정** → **앱 실행 별칭**에서 `python.exe`, `python3.exe`를 끄세요.

### 1단계. 코드 받기

```powershell
cd $HOME\Desktop
git clone https://github.com/yujinsung03/swaithon-library.git
cd swaithon-library
```

이미 받아 두었다면 프로젝트 폴더에서 `git pull`만 하면 됩니다.

VS Code에서 **File → Open Folder**로 `swaithon-library` 폴더를 엽니다. 이후 명령은 VS Code 메뉴 **Terminal → New Terminal**에서 입력하면 편합니다(자동으로 프로젝트 폴더에서 열립니다).

### 2단계. 환경변수 파일 만들기 (`.env`, `.env.local`)

⚠️ **메모장으로 만들지 마세요.** Windows는 확장자를 숨기기 때문에 `.env`가 `.env.txt`로 저장되는 일이 많고, 그러면 앱이 파일을 못 찾습니다. **VS Code에서 만드세요.**

PowerShell로 예시 파일을 복사합니다.

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

그다음 VS Code 왼쪽 파일 목록에서 두 파일을 열어 값을 채우고 저장합니다(`Ctrl+S`).

- `backend\.env`: [2. 백엔드 환경변수](#2-백엔드-환경변수-backendenv)의 A·B·C 중 하나
- `frontend\.env.local`: Supabase 두 값 ([4. 프론트엔드 환경변수](#4-프론트엔드-환경변수-frontendenvlocal) 참고). `VITE_API_BASE_URL=http://localhost:8000`은 이미 채워져 있습니다.

파일 이름이 정확한지 확인하려면:

```powershell
Get-ChildItem backend\.env, frontend\.env.local
```

두 파일이 모두 보이면 성공입니다. `.env.txt`처럼 보이면 VS Code에서 이름을 바꾸세요.

### 3단계. 설치 (처음 한 번)

프로젝트 폴더(`swaithon-library`)에서 실행합니다.

```powershell
# 백엔드: Python 가상환경을 만들고 필요한 패키지 설치
py -m venv .venv
.venv\Scripts\python -m pip install -r backend\requirements.txt

# 프론트엔드: 패키지 설치
cd frontend
npm install
cd ..
```

- `py`가 안 되던 사람은 첫 줄을 `python -m venv .venv`로 입력하세요.
- `.venv`는 각자 컴퓨터에 만드는 폴더라 git에 올라가지 않습니다. macOS에서 만든 `.venv`를 복사해 오면 동작하지 않으니 꼭 직접 만드세요.

### 4단계. 실행 (매번)

터미널 **두 개**가 필요합니다. VS Code 터미널 오른쪽 위의 **+** 버튼으로 하나 더 엽니다.

**터미널 1: 백엔드**

```powershell
cd backend
..\.venv\Scripts\uvicorn app.main:app --reload --port 8000 --timeout-graceful-shutdown 2
```

`Application startup complete.`가 보이면 켜진 것입니다. 이 터미널은 닫지 말고 그대로 두세요.

**터미널 2: 프론트엔드**

```powershell
cd frontend
npm run dev
```

`Local: http://localhost:5173/`이 보이면 Chrome에서 그 주소를 엽니다. 마이크 권한을 물으면 **허용**하세요.

끌 때는 각 터미널에서 `Ctrl+C`를 누릅니다(`Terminate batch job (Y/N)?`가 나오면 `Y`).

> **명령 프롬프트(cmd)를 쓴다면**: 위 명령은 대부분 그대로 되지만, 파일 복사는 `Copy-Item` 대신 `copy backend\.env.example backend\.env`를 쓰고, `cd $HOME\Desktop` 대신 `cd %USERPROFILE%\Desktop`을 쓰세요.

## 잘 안 될 때

앱의 오류 메시지는 고른 앱 언어로 나옵니다. 아래는 영어 화면 기준입니다. 자세한 원인은 **백엔드 터미널**에 찍힙니다.

| 증상 | 확인할 것 |
|---|---|
| `Could not reach the server` | 백엔드(터미널 1)가 켜져 있는지 |
| `The AI is busy right now` | 백엔드 터미널의 오류를 보세요. `No AI key is set`이면 `backend/.env`에 키를 넣고 백엔드를 다시 켜기 |
| `The AI is used up for now` | Gemini 무료 한도를 다 썼거나 유료 API 크레딧이 떨어짐. 내일 다시 하거나 다른 키 사용 |
| 백엔드 터미널에 `The AI API key was rejected` | 키를 잘못 복사했는지(앞뒤 공백, 따옴표) |
| 백엔드 터미널에 `Waiting for connections to close`가 뜨고 멈춤 | 실행 명령에 `--timeout-graceful-shutdown 2`가 있는지. 없으면 Ctrl+C로 끄고 위 명령으로 다시 실행 |
| 마이크 버튼이 반응 없음 | Chrome인지, 주소창 왼쪽 자물쇠 아이콘에서 마이크를 허용했는지 |
| Learn 오른쪽 위에 `● This device only` | `frontend/.env.local`의 Supabase 값과 `VITE_` 이름 확인 후 `npm run dev` 다시 실행 |
| 음성 받아쓰기가 섞인 언어를 틀림 | 음성을 Gemini가 받아쓰도록 `GEMINI_API_KEY`를 넣기 ([2. 백엔드 환경변수](#2-백엔드-환경변수-backendenv)의 A 또는 B) |

### Windows에서 자주 나는 오류

| 증상 | 해결 방법 |
|---|---|
| `npm : 이 시스템에서 스크립트를 실행할 수 없으므로 ... npm.ps1 파일을 로드할 수 없습니다` (영어: `running scripts is disabled on this system`) | PowerShell 보안 설정 때문입니다. PowerShell에 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`를 입력하고 `Y`를 누른 뒤 터미널을 다시 여세요. 바꾸기 싫다면 `npm` 대신 `npm.cmd`로 입력해도 됩니다 (예: `npm.cmd run dev`) |
| `'py'은(는) 내부 또는 외부 명령...이 아닙니다` / `python`을 치면 Microsoft Store가 열림 | Python이 PATH에 없습니다. [0단계](#0단계-프로그램-설치-처음-한-번)의 Python 안내를 다시 보세요 |
| `..\.venv\Scripts\uvicorn` 을(를) 찾을 수 없음 | 3단계 설치를 안 했거나, `backend` 폴더 안이 아닌 곳에서 실행했습니다. `cd backend` 후 다시 실행하세요 |
| 키를 넣었는데 `No AI key is set` | 파일 이름이 `.env.txt`가 되었을 가능성이 큽니다. 2단계의 `Get-ChildItem`으로 확인하고, 고친 뒤 백엔드를 껐다 켜세요 |
| Learn 오른쪽 위에 `● This device only` | `frontend\.env.local`의 이름과 `VITE_` 접두사를 확인하고, `npm run dev`를 껐다 다시 켜세요 (환경변수는 켤 때만 읽습니다) |
| 마이크 버튼을 눌러도 아무 소리도 인식 안 됨 | ① Chrome 주소창 왼쪽 자물쇠 아이콘 → 마이크 **허용** ② Windows 설정 → **개인 정보 및 보안** → **마이크** → "마이크 액세스"와 "데스크톱 앱이 마이크에 액세스하도록 허용"을 켜기 ③ 설정 → 시스템 → 소리에서 입력 장치가 맞는지 확인 |
| `[Errno 10048] ... only one usage of each socket address` / 8000번 포트 사용 중 | 백엔드가 이미 다른 터미널에서 켜져 있습니다. 그 터미널에서 `Ctrl+C`로 끄거나, PowerShell에서 `Get-NetTCPConnection -LocalPort 8000` 으로 프로세스 번호(OwningProcess)를 찾아 `Stop-Process -Id 번호`로 끄세요 |
| `Port 5173 is in use, trying another one...` | 프론트엔드가 이미 켜져 있습니다. 새로 뜬 주소(예: 5174)로 열면 백엔드가 그 주소를 허용하지 않아 서버 연결 오류가 납니다. 기존 터미널을 `Ctrl+C`로 끄고 다시 실행하세요 |
| Windows 방화벽 창이 뜸 | 이 앱은 내 컴퓨터(localhost)에서만 통신하므로 **취소**해도 동작합니다 |

## Supabase

- 테이블 구조와 보안 규칙은 [`supabase/schema.sql`](supabase/schema.sql)에 있습니다. 처음 한 번 SQL Editor에서 실행하면 됩니다([3. Supabase 준비](#3-supabase-준비-피드백-도감-저장-선택)).
- 보안 규칙 때문에 각 익명 계정은 자기 기록만 읽고 쓸 수 있습니다.
- 별표(중요 표시)는 기존 `payload` 칸에 함께 저장하므로 테이블을 바꾸지 않아도 됩니다.

## 더 보기

- 백엔드 엔드포인트, 프롬프트 수정 방법: [backend/README.md](backend/README.md)
