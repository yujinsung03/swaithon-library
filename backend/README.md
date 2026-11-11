# backend

FastAPI 서버가 들어갈 자리입니다. LLM API가 정해지면 여기서 시작합니다.

## 구현할 엔드포인트

요청·응답 형식은 `frontend/src/api/types.ts`와 똑같이 맞춥니다.

| 엔드포인트 | 하는 일 |
|---|---|
| `POST /speak/intent` | 사용자가 한 말 → 영어 의도 문장 |
| `POST /speak/rewrite` | 의도 + 관계 + 친밀도 → 한국어 표현, 수정 내역, 이유 |
| `POST /listen/explain` | 한국어 문장 → 번역, 표현별 설명, 문화 맥락 |
| `POST /writing/compose` | 상황 + 의도 + 받는 사람 → 문장, 이유 |

## 프론트와 연결

`frontend/.env.local`에 서버 주소를 넣으면 프론트가 목업 대신 이 서버를 부릅니다.

```
VITE_API_BASE_URL=http://localhost:8000
```

LLM API 키는 이 서버의 환경변수에만 두고, 프론트에는 절대 넣지 않습니다.
