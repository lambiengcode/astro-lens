# astro-lens

[English](README.md) · [Tiếng Việt](README.vi.md) · [简体中文](README.zh-Hans.md) · [繁體中文](README.zh-Hant.md) · **한국어**

자미두수(紫微斗數) 명반을 뽑고 해석문을 생성하는 도구입니다. 생년월일과 시진, 성별을
입력하면 앱이 십이궁 명반을 로컬에서 계산해 그려 주고, 그 명반을 Gemini에 넘겨 길고
구조가 잡힌 해석문을 받아 옵니다. 인터페이스도, 용어도, 해석문 자체도 — 전부 다섯 개
언어로 제공됩니다.

시각 체계의 이름은 **Thiên Văn Đài(천문대)** 입니다. 어둡고 평평하며 타이포그래피
중심인 체계로, 모서리 반경은 단 하나뿐이고 그림자도 그라디언트도 쓰지 않습니다.
해석문만은 밝은 「종이」면 위에 따로 놓이며, PDF로 내보낼 때 담기는 것도 바로 그 면
입니다.

---

## 화면 미리보기

[![궁위 관계 오버레이](public/screenshots/chart-relations.png)](public/screenshots/chart-relations.png)

**궁위 관계 오버레이** — 궁위에 마우스를 올리면 충조는 호박색, 삼합은 청색 선으로 명반 위에 바로 그려집니다.

<table>
<tr>
<td width="33.3%" align="center"><a href="public/screenshots/chart.png"><img src="public/screenshots/chart.png" width="340" alt="십이궁 명반"></a><br><b>십이궁 명반</b></td>
<td width="33.3%" align="center"><a href="public/screenshots/reading.png"><img src="public/screenshots/reading.png" width="340" alt="해석문"></a><br><b>해석문</b></td>
<td width="33.3%" align="center"><a href="public/screenshots/daivan.png"><img src="public/screenshots/daivan.png" width="340" alt="대한 타임라인"></a><br><b>대한 타임라인</b></td>
</tr>
</table>

<table>
<tr>
<td width="33.3%" align="center"><a href="public/screenshots/landing.png"><img src="public/screenshots/landing.png" width="220" alt="첫 화면"></a><br><sub><b>첫 화면</b></sub></td>
<td width="33.3%" align="center"><a href="public/screenshots/chat.png"><img src="public/screenshots/chat.png" width="220" alt="대화"></a><br><sub><b>대화</b></sub></td>
<td width="33.3%" align="center"><a href="public/screenshots/chart-ko.png"><img src="public/screenshots/chart-ko.png" width="220" alt="한국어"></a><br><sub><b>한국어</b></sub></td>
</tr>
</table>

모든 스크린샷은 내장된 개발용 예시 명반으로 찍은 것이라 실제 인물의 출생 정보가 들어
있지 않습니다. `npm run screenshots`로 다시 만듭니다.

---

## 빠르게 시작하기

**사전 준비**

- Node 20 이상(개발 환경은 24.4). `package.json`에 엔진은 고정돼 있지 않습니다.
- Google Gemini API 키 하나. 키가 없어도 명반은 그대로 계산되고 그려집니다 — 네트워크가
  필요한 것은 해석문과 대화뿐입니다.

```bash
npm install
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env   # .env 생성
npm run dev                                             # http://localhost:3000
```

그런 다음 <http://localhost:3000>을 열고 폼을 채웁니다.

API 호출을 쓰지 않고 화면만 보고 싶다면 `/`나 `/result` 뒤에 `?fixture=tuvi-ty`를
붙이세요 — 아래 [개발용 예시 명반](#개발용-예시-명반)을 보세요.

### 환경 변수

| 변수 | 필수 여부 | 용도 |
|---|---|---|
| `GEMINI_API_KEY` | 해석문 생성 시 필수 | Google Gemini 키. gitignore된 `.env`에 넣으세요. 반드시 본인 키를 쓰고, 키를 커밋하지 마세요. |
| `PARITY_PORT` | 아니오 | 시각 대조 도구가 직접 띄우는 dev server의 포트. 기본값 `3100`. |
| `SHOT_PORT` | 아니오 | 스크린샷 도구가 직접 띄우는 dev server의 포트. 기본값 `3200`. |
| `SHOT_ONLY` | 아니오 | 쉼표로 구분한 스크린샷 이름. 일부만 다시 찍을 때 씁니다. |

---

## npm 스크립트

| 스크립트 | 하는 일 |
|---|---|
| `npm run dev` | 3000 포트에서 Next dev server를 띄웁니다. |
| `npm run build` | 프로덕션 빌드. **`dev`와 `.next`를 공유합니다** — 아래 거친 부분을 보세요. |
| `npm start` | 프로덕션 빌드 결과물을 서빙합니다. |
| `npm run lint` | ESLint. 「깨끗하다」는 것은 아래에 적힌 알려진 오류 세 개*만* 남았다는 뜻입니다. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest — 단위 테스트 245개. 빠르고 네트워크를 쓰지 않아 마음껏 돌려도 됩니다. |
| `npm run test:watch` | 같은 것의 watch 모드. |
| `npm run parity` | Playwright. 렌더된 화면 열두 개를 디자인 기준안과 대조하고, 언어별 레이아웃 스트레스 테스트와 모션 감소 테스트도 함께 돌립니다. dev server를 직접 띄웁니다. |
| `npm run eval` | **해석 품질 평가.** 진짜 Gemini 호출, 약 20분, 실제 비용. `test`나 CI에는 절대 넣지 않습니다. 아래를 보세요. |
| `npm run screenshots` | `public/screenshots/`를 다시 만듭니다. 대화 스크린샷 한 장 때문에 Gemini 호출을 한 번 씁니다. |
| `./tests/tools/token-audit.sh` | 스타일시트에서 디자인 체계를 어기는 표현을 훑습니다: 규격 외 모서리 반경, 토큰 밖의 색, 그림자, 그라디언트. |

---

## 구조

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/architecture-dark.png">
  <img alt="astro-lens 구조" src="docs/architecture-light.png">
</picture>

독자 → `proxy.ts`의 언어 판별 → App Router → `/api/analyze`. 명반은 `iztro`로 로컬에서 계산되고, 독자의 프롬프트 팩을 불러온 뒤에 Gemini를 부릅니다. 후속 질문은 `/api/chat`이 맡고, `gemini-cache.ts`가 캐시된 시스템 지시와 참고서를 공급하며, 내보내기는 종이 변형 위에 다시 그립니다.

[`docs/astro-lens-architecture.html`](docs/astro-lens-architecture.html)을 열면 직접 살펴볼 수 있습니다 — 이동, 확대, 검색, 세 가지 안내 보기. 원본 명세는 [`docs/astro-lens.architecture.json`](docs/astro-lens.architecture.json)입니다.

### 명반은 로컬에서 계산합니다

`src/lib/iztro.ts`는 [iztro](https://github.com/SylarLong/iztro)를 감쌉니다. 실제
역법 계산은 iztro가 합니다: 양력→음력 변환, 십이궁, 십사주성, 보조성과 잡요 고리,
밝기, 사화, 그리고 대한·유년 오버레이까지. 네트워크도 키도 필요 없습니다.

**인터페이스가 어떤 언어든 명반은 언제나 `vi-VN`으로 생성되고**, 번역은 그리는
시점에 일어납니다. 의도한 선택입니다. 베트남어 출력이 나머지 전부를 잇는 조인 키가
되고, 언어를 바꿔도 명반을 다시 뽑는 일이 결코 없습니다.

`src/lib/branches.ts`에는 iztro 위에 UI가 더 필요로 하는 지지 연산이 들어 있습니다 —
대궁을 구하는 `xung()`, 삼합의 나머지 두 모서리를 구하는 `tamHop()`. 궁위 관계
오버레이가 그리는 것이 바로 이것입니다. `src/lib/bazi.ts`는 선택적인 사주팔자 계산을
더해 보조 체계로 프롬프트에 실어 보냅니다.

### 해석문은 세 겹의 프롬프트입니다

`src/lib/gemini.ts`는 세 부분으로 요청 하나를 조립합니다:

1. **시스템 지시** — 방법론. 참고 PDF(`astro-lens.pdf`)와 함께 Gemini의 *컨텍스트
   캐시*로 묶여 올라가므로, 요청마다 보내지 않고 한 번만 올립니다.
2. **데이터 컨텍스트** — 명반을 라벨 붙은 텍스트로 편 것. 모든 값이 용어표를 거치므로,
   한국어 독자를 맡은 모델은 Tử Vi와 Mệnh가 아니라 자미와 명궁 위에서 추론합니다.
3. **작업 지시** — 연쇄 추론 절차, 자기 점검 목록, 출력 서식. 요청마다 매번 보냅니다.

세 겹 모두 언어별로 `src/lib/prompt/<locale>.ts`에 있고, `src/lib/gemini-cache.ts`가
언어마다 캐시를 하나씩 관리합니다.

이 층에서 틀리기 쉬운 것이 둘 있고, 둘 다 실제로 물린 적이 있습니다:

- **캐시가 살아 있는 한 시스템 지시를 고쳐도 아무 효과가 없습니다.** 캐시는 오로지
  *표시 이름*으로만 찾고 내용을 비교하지 않으며, TTL이 90일입니다. 요청마다 달라지는
  규칙은 작업 지시 층에 넣어야 합니다.
- **조건부 절은 말리는 것이 아니라 지워야 합니다.** 사주 절과 자기소개 절은 `⟦BAZI⟧` /
  `⟦SELF⟧` 표식으로 감싸 두고, 데이터가 없으면 `renderTask()`가 통째로 걷어냅니다.
  「데이터가 없으면 이 절은 건너뛰라」는 지시는 다섯 언어 중 네 언어가 무시하고 데이터를
  지어내는 것이 실측으로 확인됐습니다.

### 근거

해석문의 실질적인 판단에는 모두 그 근거가 되는 궁과 성요를 밝힌 줄이 붙습니다.
해석문 본문에서는 markdown 인용문이고, 스크린샷에 보이는 들여쓴 블록으로 그려집니다.
대화에서는 답변 끝의 근거를 `src/lib/citation.ts`가 떼어내 따로 한 줄로 보여 줍니다.
대화 말풍선은 의도적으로 인용 블록을 그리지 않기 때문입니다.

두 화면은 블록 markdown 파서 하나(`src/lib/markdown.ts`)를 함께 씁니다. 그래서 답변
속 제목과 목록이 `###`과 `*` 그대로 보이지 않고 제대로 배치됩니다. 둘의 차이는 변형뿐
입니다: `document`는 진짜 제목과 `.sealq` 근거 블록을 내보내고, `bubble`은 제목을
말풍선 자신의 글자 크기에 맞춘 굵은 도입 줄로 만들며 `>`로 시작하는 줄은 평범한
본문으로 그립니다.

근거 한 줄이 궁을 둘 적을 수도 있습니다 — 이 학문에서 대궁은 원래 근거의 일부입니다 —
그러니 근거를 파싱하는 코드는 각 성요를 그 *바로 앞에* 오는 궁에 붙여야 하며, 줄의 첫
번째 궁에 붙여서는 안 됩니다.

### 다국어

세 종류의 텍스트, 세 개의 서로 다른 자리. 하나를 다른 하나의 파일에 넣는 실수를 막으려고
있는 구조입니다:

| | 있는 곳 | 규칙 |
|---|---|---|
| 인터페이스 문구 | `src/lib/i18n/messages/<locale>.ts` | `vi.ts`가 타입의 출처이고, 나머지 넷은 같은 인터페이스를 정확히 만족해야 합니다. |
| 도메인 용어 | `src/lib/i18n/vocabulary.ts` | 표 하나, 약 193개 개념 × 5개 언어. 기억으로 쓴 것이 아니라 iztro가 자체적으로 싣고 있는 언어 데이터에서 가져왔습니다. |
| 모델 프롬프트 | `src/lib/prompt/<locale>.ts` | 지시 언어, 출력 언어, 용어가 모두 독자를 따라갑니다. |

도메인 값은 반드시 `useI18n().v(value, domain)`을 거쳐 그리고, 원값을 그대로 쓰지
마세요.

**언어 판정**은 `src/proxy.ts`에서 일어납니다 — Next 16이 예전 `middleware.ts`에 새로
붙인 이름입니다. 순서는 `?lang=` → 쿠키 → `Accept-Language` → `vi`. 경로는 절대
고쳐 쓰지 않으므로 모든 URL이 원래대로 남고, 판정된 언어는 요청 헤더에 실려 렌더에
전달됩니다.

### 디자인 체계는 유틸리티 클래스가 아니라 CSS입니다

시각 체계 전체가 `src/app/globals.css`에 의미 있는 컴포넌트 클래스로 들어 있습니다 —
`.pal`, `.maj`, `.centre`, `.tl-row`, `.paper`, `.sealq`, `.kv`, `.card`. 컴포넌트는
스타일을 그 자리에서 다시 짜지 않고 이 클래스 이름을 내보낼 뿐입니다. Tailwind도 깔려
있고 자잘한 레이아웃에는 써도 되지만, **새 화면은 기존 컴포넌트 클래스를 재사용하거나
`globals.css`에 하나를 새로 추가해야 합니다.**

양보할 수 없는 규칙들은 `./tests/tools/token-audit.sh`가 기계적으로 확인합니다:
모서리 반경은 하나(`3px`), 흐림·광휘·입체 그림자·그라디언트 텍스트 금지, 색은 CSS
변수에서만, 세거나 날짜를 적는 자리는 모두 고정폭 글꼴로. 스타일을 건드렸으면 이 검사를
한 번 돌리세요.

---

## 다섯 개 언어

`vi`(기본) · `zh-Hans` · `zh-Hant` · `ko` · `en`.

지원은 끝까지 내려갑니다. 인터페이스도, 성요와 궁의 이름도, 생성된 해석문도 모두 독자의
언어입니다 — 한국어 사용자는 베트남어 해석문을 한국어로 감싼 것이 아니라, 한국어 성요
이름 위에서 추론한 한국어 해석문을 받습니다.

`?lang=ko`(또는 `zh-Hans`, `zh-Hant`, `en`, `vi`)로 바꾸거나 앱 바의 언어 선택기를
쓰면 됩니다. 선택은 쿠키에 기억됩니다.

---

## 테스트

### `npm run test` — 단위 테스트 245개

궁위 관계 연산, 지지 대응, 대한 진행도, 용어표의 완전성, 프롬프트 팩의 구조, 인쇄 변형,
그리고 해석 품질 검사기 자체까지. 네트워크를 쓰지 않습니다. 늘 돌려야 하는 것이 이것
입니다.

**평가용 검사기에도 자체 단위 테스트가 있다**는 점을 기억하세요. 일부러 오류를 심은
합성 해석문으로 돌립니다. 검사기가 동작한다는 것을 증명하려고 API 호출을 쓰는 일은
절대 없어야 합니다.

### `npm run eval` — 해석 품질

모델이 *실제로 무엇을 말했는지*를, 그 모델이 받았던 명반과 대조해 확인하는 유일한
도구입니다. 얼린 표준 명반 두 장 × 다섯 언어 = 열 편의 실제 해석문을 돌립니다.

> **약 20분이 걸리고 실제 API 비용이 나갑니다.** 일부러 `npm run test`에서 빼 두었고,
> CI에 넣어서도 안 됩니다.

결정적 검사 다섯 가지. 전부 베트남어 문자열을 맞춰 보는 대신 용어표를 거치므로 다섯
언어 모두에서 성립합니다:

| 검사 | 무엇을 확인하나 |
|---|---|
| 1 · 지어내기 | **성요의 낙궁.** 해석문이 어떤 궁에 넣은 주성이 정말 그 궁에 있는지 봅니다. 빈 궁이 성요를 빌려 온 경우는 인정합니다. 「이 성요가 명반에 있는가」를 묻는 것이 아닙니다 — 완전한 명반은 주성과 보조성 스물여덟을 이미 어딘가에 배치해 두므로 그 질문은 공허합니다. |
| 2 · 커버리지 | 십이궁을 실제로 모두 논했는지. |
| 3 · 언어 | 본문이 독자의 문자 체계로 쓰였는지, 그리고 명반 데이터에서 새어 나온 베트남어가 섞이지 않았는지. |
| 4 · 길이 | 본문이 자기 프롬프트가 요구한 분량을 채웠는지. |
| 5 · 구조 | 번호가 붙은 절이 빠짐없이 순서대로 있는지, 조건부 절이 해당 데이터가 있을 때만 나오는지, 판단하는 절에 근거가 붙어 있는지. |

쓸 만한 플래그: `--locale`, `--chart`, `--tag`, 그리고 저장된 해석문으로 검사만 다시
돌려 API를 **한 번도** 부르지 않는 `--reuse`. 해석문은 `tests/eval/out/<tag>/`에
쌓입니다. [EVAL.md](EVAL.md)는 지난 실행들이 무엇을 찾아냈는지 적은 기록이며, 검사기를
여러 번 다시 쓰게 만든 측정값들도 거기에 있습니다.

### `npm run parity` — 시각 충실도

화면 열두 개를 두 가지 뷰포트에서 렌더해 얼린 디자인 기준안과 대조하고, 언어별 레이아웃
스트레스 테스트 스무 개와 모션 감소 세트를 함께 돌립니다.

**기준은 픽셀이 아니라 기하입니다.** 테스트는 픽셀 차이 비율을 보고하지만 그 숫자는
어디까지나 대리 지표이고, 몇몇 화면이 0.5% 문턱을 넘는 것은 정당합니다. 실제로 판정하는
것은 *상자*가 맞아떨어지는지입니다 — 화면마다 정해진 선택자 목록에서 각 요소의 위치와
크기와 간격. 글자가 어떻게 래스터화됐는지와 무관하기 때문입니다. [PARITY.md](PARITY.md)에
모든 측정값과, 받아들인 모든 차이와, 그 이유가 적혀 있습니다. **시각적인 것을 바꾸기
전에 반드시 읽으세요.** 디자인의 「버그」처럼 보이는 것 여럿이 사연 있는 결정입니다.

이 도구는 실행 중인 dev server를 먼저 멈추고 자기 것을 띄웁니다. Next 16은 프로젝트
디렉터리당 dev server를 하나만 허용하고, 그러지 않으면 Turbopack이 헤드리스
클라이언트에 오래된 스타일시트를 내주기 때문입니다.

### 개발용 예시 명반

`/`나 `/result`에 `?fixture=tuvi-ty`를 붙이면 `src/lib/fixture.ts`에서 교과서적인 예시
명반을 불러옵니다. 미리 써 둔 해석문이 딸려 있고 대한의 기준 날짜가 고정돼 있어, 해가
바뀌어도 스냅샷이 상하지 않습니다. 시각 대조 화면과 이 README의 스크린샷이 재현 가능한
것은 이것 덕분입니다.

`NODE_ENV === 'production'`이면 `loadFixture`가 `null`을 돌려주므로, 배포된 빌드에서는
닿을 수 없습니다.

---

## 알려진 제약과 거친 부분

모두 실제이고 현재 유효한 사항입니다. 신비로울 것은 없고, 여러분이 다시 밟지 않도록
적어 둔 것입니다.

- **해석문 한 편에 3분쯤 걸립니다.** 사고 강도를 높인 길고 구조적인 생성이라 그렇습니다.
  UI가 대기 상태를 보여 주지만, 해석문을 짧게 만들지 않는 한 빠르게 만들 방법은 없습니다.
- **캐시 표시 이름을 바꾸면 기존 캐시가 버려집니다.** Gemini는 컨텍스트 캐시를 표시
  이름으로만 찾기 때문에, `src/lib/gemini-cache.ts`의 `CACHE_DISPLAY_NAME`을 고치면
  90일짜리 기존 캐시가 소리 없이 버려지고 참고 PDF가 다시 올라갑니다. 캐시가 다시 덥혀질
  때까지 언어마다 첫 해석문이 느립니다. 프로젝트 이름을 `astro-lens`로 바꿀 때 실제로
  일어난 일입니다.
- **`npm run lint`이 오류 세 개를 내는 것이 정상입니다.**
  `src/app/api/candidates/route.ts`(35, 38, 41행)에 원래부터 있던
  `@typescript-eslint/no-explicit-any` 세 개입니다. 이 셋만 남았을 때 lint가 「깨끗
  하다」고 봅니다. 그 밖의 출력은 여러분이 만든 것입니다.
- **`next build`와 `next dev`가 `.next`를 공유합니다.** 같은 디렉터리에서 빌드한 뒤
  dev server를 띄우면 모든 경로에 404를 돌려주는 상태가 될 수 있습니다. `rm -rf .next`
  후 다시 띄우세요.
- **CJK 글꼴은 `next/font`가 아니라 Google Fonts 스타일시트에서 옵니다.**
  `next/font/google`에는 Noto 계열의 CJK 서브셋이 없어서, 빌드할 때 unicode-range
  조각을 전부 자체 호스팅해 버립니다. 루트 레이아웃은 현재 언어에 맞는 스타일시트
  하나만 링크하고 그 뒤에 시스템 CJK 스택을 둡니다.
- **베트남어 성조 부호는 조심해야 합니다.** 글꼴이 `vietnamese` 서브셋을 반드시
  불러와야 하고, 애니메이션이 걸린 베트남어 텍스트에 맨 `overflow: hidden`을 주면 dấu
  nặng과 dấu hỏi가 잘립니다 — `globals.css`에 이미 있는 padding／음수 margin 짝을
  쓰세요.
- **TOON 인코딩은 해 보고 걷어냈습니다.** [EVAL.md](EVAL.md) §4에 실측이 남아 있습니다.
  명반 데이터 컨텍스트를 22.6% 줄이지만 그 컨텍스트가 프롬프트의 4.3%뿐이라, 호출
  전체로는 1.79%만 움직이고 실제 소요 시간은 전혀 줄지 않습니다. 다시 생각하기 전에
  §4를 읽으세요.

---

## 저장소 구조

```
src/
  app/                 Next App Router — 페이지와 API 라우트 셋
    api/analyze/       해석문 생성
    api/chat/          이어 묻기
    api/candidates/    태어난 시진을 모를 때의 후보 명반
  components/
    chart/             격자, 상세 서랍, 대한 표, 해석문
    chat/              대화 패널
    ui/                폼, 헤더, 푸터, 로딩
  lib/
    iztro.ts           명반 생성
    bazi.ts            선택적인 사주팔자
    branches.ts        충조 / 삼합 연산
    chart-derived.ts   빈 궁의 차성(借星)
    rel-overlay.ts     궁위 관계 선
    citation.ts        대화 답변에서 근거를 떼어냄
    markdown.ts        두 화면이 함께 쓰는 블록 markdown 파서
    gemini.ts          프롬프트 조립
    gemini-cache.ts    언어별 컨텍스트 캐시
    prompt/            다섯 벌의 프롬프트 팩
    i18n/              문구, 용어표, 언어 판정
    fixture.ts         개발용 예시 명반
  proxy.ts             언어 판정(Next 16의 middleware)
tests/
  unit/                vitest
  parity/              Playwright 시각 대조
  eval/                해석 품질 평가 도구
  tools/               스크린샷, PDF 내보내기, 접근성과 디자인 토큰 검사
```

이어서 읽을 것, 모두 이 저장소 안에 있습니다: 무엇이든 고치기 전에 알아 둘 만한 관행은
[AGENTS.md](AGENTS.md), 시각 기록과 그 확정된 결정들은 [PARITY.md](PARITY.md), 모델의
출력이 실제로 어떻게 측정됐는지는 [EVAL.md](EVAL.md).
