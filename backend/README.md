# backend

FastAPI 서버입니다. 글 작업은 OpenAI(또는 OpenAI 호환 서비스)를 먼저 쓰고 없거나 실패하면 Gemini로, 녹음 받아쓰기는 Gemini를 먼저 씁니다. 키 설정은 [루트 README](../README.md#2-백엔드-환경변수-backendenv)를 보세요.

## 실행

```bash
# 프로젝트 루트에서 (처음 한 번)
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# backend/.env.example을 backend/.env로 복사하고 키 입력 (루트 README의 "백엔드 환경변수" 참고)
cd backend
../.venv/bin/uvicorn app.main:app --reload --port 8000 --timeout-graceful-shutdown 2
```

- http://localhost:8000/health : 서버 상태와 키 설정 여부
- http://localhost:8000/docs : API를 브라우저에서 직접 호출해 볼 수 있는 문서

## 파일

| 파일 | 역할 |
|---|---|
| `app/main.py` | 엔드포인트 정의, CORS |
| `app/prompts.py` | AI에게 주는 지시문. **답변 품질은 여기서 다듬습니다** |
| `app/llm.py` | OpenAI 호환 API·Gemini 호출, 모델 순서대로 대체, JSON 형식 강제, 에러 처리 |
| `app/schemas.py` | 요청·응답 형식 (`frontend/src/api/types.ts`와 동일) |

## 엔드포인트

요청·응답 형식은 `frontend/src/api/types.ts`와 똑같이 맞춥니다. AI를 쓰는 요청은 모두 `language`(앱 언어: `en`, `ja`, `zh`, `vi`, `th`, `ru`)를 받고, 설명·번역을 그 언어로 씁니다.

| 엔드포인트 | 하는 일 |
|---|---|
| `GET /health` | 서버 상태, 쓰는 모델 순서, 키 설정 여부 |
| `POST /speak/intent` | 사용자가 한 말(텍스트 또는 **녹음 WAV**) → 받아쓰기(`sourceText`) + 뜻 확인 문장(`intentEnglish`). 확인 문장은 한국어를 뺀 사용자의 주 언어로 씀(한국어만 쓰면 앱 언어). 필드 이름은 호환을 위해 그대로 둠 |
| `POST /speak/rewrite` | 확인된 뜻 + 관계 + 친밀도 → 입말 한국어(해요체/반말), 말투 이름, 바뀐 부분과 이유 |
| `POST /listen/transcribe` | 상대방 말 **녹음 WAV** → 한국어 받아쓰기(띄어쓰기, 질문이면 `?`) |
| `POST /listen/explain` | 한국어 문장 → 실제 의미 번역(`english` 필드, 내용은 앱 언어), 표현·문화 설명 |
| `POST /writing/compose` | 상황 + 받는 사람 + 하고 싶은 말 → 제목, 메시지, 번역, 표현 설명 |
| `POST /writing/compose/stream` | 위와 같지만 쓰는 대로 보냄 (줄마다 JSON: `delta` / `done` / `error`) |
| `POST /learn/search-terms` | 도감 검색어 → 같은 뜻의 한국어·영어·앱 언어 단어 목록 |

## AI 모델 순서

`app/llm.py`가 `.env`에 적힌 순서대로 모델을 부르고, 실패하면(한도 초과 429, 없는 모델 404, 서버 오류 5xx 등) 다음 모델로 넘어갑니다.

- **글 작업**: OpenAI 호환 API(`AI_GATEWAY_MODELS`, 기본 gpt-6.1-sol) → Gemini(`GEMINI_MODELS`)
- **녹음 받아쓰기**: Gemini(`GEMINI_AUDIO_MODELS`) → OpenAI 호환 API(`AI_GATEWAY_AUDIO_MODELS`)
- `AI_GATEWAY_BASE_URL`의 기본값은 OpenAI(`https://api.openai.com/v1`)입니다. 다른 서비스를 쓰면 그 주소를 넣습니다.
- `GEMINI_BASE_URL`을 넣으면 Google 대신 Gemini API 형식을 제공하는 다른 서비스로 보냅니다.
- 답 형식을 지정하는 옵션(`json_schema`)을 받지 않는 모델(예: gpt-audio-1.5)에는 형식을 지시문에 직접 적어 보냅니다.

## 프론트와 연결

`frontend/.env.local`에 서버 주소를 넣으면 프론트가 목업 대신 이 서버를 부릅니다.

```
VITE_API_BASE_URL=http://localhost:8000
```

LLM API 키는 이 서버의 환경변수에만 두고, 프론트에는 절대 넣지 않습니다.
