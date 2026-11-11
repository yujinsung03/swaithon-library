# backend

FastAPI + Google Gemini API 서버입니다.

## 실행

```bash
# 프로젝트 루트에서 (처음 한 번)
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# backend/.env.example을 backend/.env로 복사하고 GEMINI_API_KEY 입력
cd backend
../.venv/bin/uvicorn app.main:app --reload --port 8000 --timeout-graceful-shutdown 2
```

- http://localhost:8000/health : 서버 상태와 키 설정 여부
- http://localhost:8000/docs : API를 브라우저에서 직접 호출해 볼 수 있는 문서

## 파일

| 파일 | 역할 |
|---|---|
| `app/main.py` | 엔드포인트 정의, CORS |
| `app/prompts.py` | Gemini에게 주는 지시문. **답변 품질은 여기서 다듬습니다** |
| `app/llm.py` | Gemini 호출, JSON 형식 강제, 에러 처리 |
| `app/schemas.py` | 요청·응답 형식 (`frontend/src/api/types.ts`와 동일) |

## 엔드포인트

요청·응답 형식은 `frontend/src/api/types.ts`와 똑같이 맞춥니다.

| 엔드포인트 | 하는 일 |
|---|---|
| `POST /speak/intent` ✅ | 사용자가 한 말(텍스트 또는 **녹음 WAV**) → 정확한 받아쓰기 + 영어 의도 문장. 녹음이 오면 Gemini가 섞어 말한 언어를 그대로 받아씀 |
| `POST /speak/rewrite` ✅ | 의도 + 관계 + 친밀도 → 한국어 표현, 수정 내역, 이유 |
| `POST /listen/explain` ✅ | 한국어 문장 → 번역, 표현별 설명, 문화 맥락 |
| `POST /writing/compose` ✅ | 상황 + 의도 + 받는 사람 → 문장, 이유 |

## 프론트와 연결

`frontend/.env.local`에 서버 주소를 넣으면 프론트가 목업 대신 이 서버를 부릅니다.

```
VITE_API_BASE_URL=http://localhost:8000
```

LLM API 키는 이 서버의 환경변수에만 두고, 프론트에는 절대 넣지 않습니다.
