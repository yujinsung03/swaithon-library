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

> **Windows를 쓰나요?** 아래 1~3번(키 받기, 환경변수)은 똑같이 하고, 4번부터는 맨 아래 **[Windows에서 실행하기](#windows에서-실행하기)**를 따라 하세요. 설치부터 실행, 자주 나는 오류까지 단계별로 적어 두었습니다.

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

### 4. 설치 (macOS)

```bash
# 프로젝트 루트에서
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

cd frontend
npm install
```

## 실행 (macOS)

터미널 두 개를 열어 각각 실행합니다. Windows는 [Windows에서 실행하기](#windows에서-실행하기)를 보세요.

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

## Windows에서 실행하기

Windows 10/11 기준입니다. 명령은 **PowerShell**에 입력합니다(VS Code 터미널의 기본값도 PowerShell). macOS와 다른 점은 주로 **경로 구분자(`\`)**와 **`.venv\Scripts`** 폴더 이름입니다.

### 0단계. 프로그램 설치 (처음 한 번)

| 프로그램 | 받는 곳 | 설치할 때 주의 |
|---|---|---|
| **Git** | https://git-scm.com/download/win | 옵션은 전부 기본값으로 Next |
| **Node.js (LTS)** | https://nodejs.org | LTS 버전을 받아 기본값으로 설치 |
| **Python 3.10 이상** | https://www.python.org/downloads/ | ⚠️ 설치 첫 화면 아래의 **"Add python.exe to PATH"를 반드시 체크** |
| **VS Code** | https://code.visualstudio.com | `.env` 파일을 만들 때 씁니다 |
| **Chrome** | https://www.google.com/chrome | 음성 인식은 Chrome·Edge에서만 됩니다 |

설치가 끝나면 **열려 있던 터미널과 VS Code를 모두 닫았다가 다시 여세요.** 그래야 새로 설치한 프로그램을 찾습니다.

제대로 설치됐는지 확인합니다. 숫자(버전)가 나오면 성공입니다.

```powershell
git --version
node --version
npm --version
py --version
```

- `py`가 없다고 나오면 `python --version`으로 해 보세요. 둘 중 되는 쪽을 아래에서 계속 쓰면 됩니다.
- `python`을 입력했는데 **Microsoft Store가 열리면** Python이 PATH에 안 들어간 것입니다. Python 설치 파일을 다시 실행해 **Modify** → **Add Python to environment variables**를 체크하거나, Windows 설정 → **앱** → **고급 앱 설정** → **앱 실행 별칭**에서 `python.exe`, `python3.exe`를 끄세요.

### 1단계. 코드 받기

```powershell
cd $HOME\Desktop
git clone https://github.com/yujinsung03/swaithon-library.git
cd swaithon-library
git switch Yoona
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

- `backend\.env`: 첫 줄 `GEMINI_API_KEY=` 뒤에 내 Gemini 키 ([1. Gemini API 키 받기](#1-gemini-api-키-받기-무료) 참고)
- `frontend\.env.local`: Supabase 두 값 ([3. 프론트엔드 환경변수](#3-프론트엔드-환경변수) 참고). `VITE_API_BASE_URL=http://localhost:8000`은 이미 채워져 있습니다.

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

### Windows에서 자주 나는 오류

| 증상 | 해결 방법 |
|---|---|
| `npm : 이 시스템에서 스크립트를 실행할 수 없으므로 ... npm.ps1 파일을 로드할 수 없습니다` (영어: `running scripts is disabled on this system`) | PowerShell 보안 설정 때문입니다. PowerShell에 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`를 입력하고 `Y`를 누른 뒤 터미널을 다시 여세요. 바꾸기 싫다면 `npm` 대신 `npm.cmd`로 입력해도 됩니다 (예: `npm.cmd run dev`) |
| `'py'은(는) 내부 또는 외부 명령...이 아닙니다` / `python`을 치면 Microsoft Store가 열림 | Python이 PATH에 없습니다. [0단계](#0단계-프로그램-설치-처음-한-번)의 Python 안내를 다시 보세요 |
| `..\.venv\Scripts\uvicorn` 을(를) 찾을 수 없음 | 3단계 설치를 안 했거나, `backend` 폴더 안이 아닌 곳에서 실행했습니다. `cd backend` 후 다시 실행하세요 |
| `GEMINI_API_KEY is not set` 인데 키를 넣었음 | 파일 이름이 `.env.txt`가 되었을 가능성이 큽니다. 2단계의 `Get-ChildItem`으로 확인하고, 고친 뒤 백엔드를 껐다 켜세요 |
| LEARN에 `Saved on this device only` | `frontend\.env.local`의 이름과 `VITE_` 접두사를 확인하고, `npm run dev`를 껐다 다시 켜세요 (환경변수는 켤 때만 읽습니다) |
| 마이크 버튼을 눌러도 아무 소리도 인식 안 됨 | ① Chrome 주소창 왼쪽 자물쇠 아이콘 → 마이크 **허용** ② Windows 설정 → **개인 정보 및 보안** → **마이크** → "마이크 액세스"와 "데스크톱 앱이 마이크에 액세스하도록 허용"을 켜기 ③ 설정 → 시스템 → 소리에서 입력 장치가 맞는지 확인 |
| `[Errno 10048] ... only one usage of each socket address` / 8000번 포트 사용 중 | 백엔드가 이미 다른 터미널에서 켜져 있습니다. 그 터미널에서 `Ctrl+C`로 끄거나, PowerShell에서 `Get-NetTCPConnection -LocalPort 8000` 으로 프로세스 번호(OwningProcess)를 찾아 `Stop-Process -Id 번호`로 끄세요 |
| `Port 5173 is in use, trying another one...` | 프론트엔드가 이미 켜져 있습니다. 새로 뜬 주소(예: 5174)로 열면 되지만, 그러면 백엔드가 그 주소를 허용하지 않아 `Failed to fetch`가 납니다. 기존 터미널을 `Ctrl+C`로 끄고 다시 실행하세요 |
| Windows 방화벽 창이 뜸 | 이 앱은 내 컴퓨터(localhost)에서만 통신하므로 **취소**해도 동작합니다 |
| `git switch Yoona` 에서 `invalid reference` | `git fetch` 후 다시 `git switch Yoona`를 입력하세요 |

> **명령 프롬프트(cmd)를 쓴다면**: 위 명령은 대부분 그대로 되지만, 파일 복사는 `Copy-Item` 대신 `copy backend\.env.example backend\.env`를 쓰고, `cd $HOME\Desktop` 대신 `cd %USERPROFILE%\Desktop`을 쓰세요.

## Supabase

`supabase/schema.sql`은 이미 프로젝트에 실행해 둔 상태입니다. 테이블을 바꿀 때만 SQL Editor에서 다시 실행하세요.

## 더 보기

- 백엔드 엔드포인트와 프롬프트 수정 방법: [backend/README.md](backend/README.md)
