# astro-lens

[English](README.md) · **Tiếng Việt** · [简体中文](README.zh-Hans.md) · [繁體中文](README.zh-Hant.md) · [한국어](README.ko.md)

Ứng dụng lập lá số Tử Vi Đẩu Số và sinh luận giải. Bạn nhập ngày sinh, giờ sinh
và giới tính; ứng dụng tính lá số mười hai cung ngay tại máy, hiển thị nó, rồi
gửi cho Gemini để nhận về một bài luận giải dài, có cấu trúc. Toàn bộ — giao
diện, thuật ngữ chuyên môn, và chính bài luận giải — đều có trong năm thứ tiếng.

Hệ thống thiết kế tên là **Thiên Văn Đài**: nền tối, phẳng, thiên về chữ, đúng
một bán kính bo góc, không đổ bóng và không chuyển sắc. Bài luận giải được đặt
trên một mặt "giấy" sáng màu riêng biệt — cũng chính là thứ mà bản xuất PDF chụp
lại.

---

## Giao diện

| | |
|---|---|
| **[Trang chủ](public/screenshots/landing.png)**<br>Biểu mẫu nhập ngày sinh, phần hero và dải số liệu. Đây là toàn bộ màn hình đầu tiên — thanh điều hướng chỉ có hai mục, đây không phải một trang giới thiệu sản phẩm. | ![Trang chủ](public/screenshots/landing.png) |
| **[Lá số 12 cung](public/screenshots/chart.png)**<br>Lá số với Cung Mệnh đang được chọn và ngăn chi tiết mở ra. Mỗi ô mang chính tinh kèm miếu vượng đắc bình hãm, các vòng phụ tinh và tạp diệu, khoảng tuổi đại vận, và can chi của cung. | ![Lá số](public/screenshots/chart.png) |
| **[Lớp phủ quan hệ](public/screenshots/chart-relations.png)**<br>Tương tác đặc trưng của ứng dụng. Rê chuột lên một cung sẽ vẽ **xung chiếu** (màu hổ phách, cung đối) và **tam hợp** (màu lam, hai đỉnh còn lại) thành đường nối trên lưới, mỗi đích đến có nhãn riêng. Ảnh này đang rê lên Tật Ách. | ![Quan hệ](public/screenshots/chart-relations.png) |
| **[Bảng đại vận](public/screenshots/daivan.png)**<br>Các đại vận mười năm dưới dạng bảng: khoảng tuổi, tên cung, sao trong cung, các năm tương ứng, và thanh tiến độ cho giai đoạn đang đi. | ![Đại vận](public/screenshots/daivan.png) |
| **[Bài luận giải](public/screenshots/reading.png)**<br>Bài luận giải trên mặt giấy, kèm các nút xuất bản. Những khối thụt vào là **dẫn chứng** — mỗi dẫn chứng nêu rõ cung và sao mà nhận định dựa vào. | ![Luận giải](public/screenshots/reading.png) |
| **[Hỏi đáp](public/screenshots/chat.png)**<br>Hỏi thêm trên chính lá số đó. Dòng chữ đơn cách dưới câu trả lời (`↳ Cung Mệnh · Liêm Trinh (bình) · …`) là dẫn chứng của câu trả lời, được tách khỏi phần nội dung để đứng riêng. | ![Hỏi đáp](public/screenshots/chat.png) |
| **[Tiếng Hàn](public/screenshots/chart-ko.png)**<br>Vẫn lá số ấy tại `?lang=ko`. Tên cung, tên sao và trạng thái miếu hãm đều được dịch — 명궁, 자미, 칠살, 왕/평/묘/함 — vì bảng thuật ngữ chuyên môn được dịch, chứ không chỉ nhãn giao diện. | ![Tiếng Hàn](public/screenshots/chart-ko.png) |

Mọi ảnh đều sinh ra từ lá số mẫu dành cho phát triển, nên không chứa dữ liệu
ngày sinh của người thật. Chụp lại bằng `npm run screenshots`.

---

## Bắt đầu nhanh

**Yêu cầu**

- Node 20 trở lên (phát triển trên 24.4). `package.json` không ghim phiên bản.
- Một khoá API Google Gemini. Không có khoá thì lá số vẫn tính và hiển thị bình
  thường — chỉ phần luận giải và hỏi đáp mới cần mạng.

```bash
npm install
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env   # tạo tệp .env
npm run dev                                             # http://localhost:3000
```

Mở <http://localhost:3000> rồi điền vào biểu mẫu.

Muốn xem giao diện mà không tốn một lần gọi API, thêm `?fixture=tuvi-ty` vào `/`
hoặc `/result` — xem [lá số mẫu](#lá-số-mẫu-dành-cho-phát-triển) bên dưới.

### Biến môi trường

| Biến | Bắt buộc | Công dụng |
|---|---|---|
| `GEMINI_API_KEY` | có, để luận giải | Khoá Google Gemini. Đặt trong `.env` (đã được gitignore). Dùng khoá của chính bạn — tuyệt đối không commit khoá. |
| `PARITY_PORT` | không | Cổng cho dev server riêng của bộ kiểm tra đối chiếu. Mặc định `3100`. |
| `SHOT_PORT` | không | Cổng cho dev server riêng của bộ chụp ảnh màn hình. Mặc định `3200`. |
| `SHOT_ONLY` | không | Danh sách tên ảnh, phân tách bằng dấu phẩy, để chụp lại chỉ một số ảnh. |

---

## Các lệnh npm

| Lệnh | Công dụng |
|---|---|
| `npm run dev` | Dev server Next trên cổng 3000. |
| `npm run build` | Bản dựng production. **Dùng chung `.next` với `dev`** — xem phần hạn chế bên dưới. |
| `npm start` | Chạy bản dựng production. |
| `npm run lint` | ESLint. "Sạch" nghĩa là *chỉ* còn ba lỗi đã biết nêu bên dưới. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest — 245 kiểm thử đơn vị. Nhanh, không cần mạng, chạy thoải mái. |
| `npm run test:watch` | Như trên nhưng ở chế độ theo dõi. |
| `npm run parity` | Playwright. Đối chiếu mười hai màn hình với bản thiết kế tham chiếu, kèm bộ kiểm tra bố cục theo từng ngôn ngữ và bộ giảm chuyển động. Tự khởi động dev server riêng. |
| `npm run eval` | **Chất lượng bài luận giải.** Gọi Gemini thật, khoảng 20 phút, tốn tiền thật. Không bao giờ được đưa vào `test` hay CI. Xem bên dưới. |
| `npm run screenshots` | Chụp lại `public/screenshots/`. Tốn một lần gọi Gemini cho ảnh hỏi đáp. |
| `./tests/tools/token-audit.sh` | Rà biểu định kiểu tìm vi phạm hệ thống thiết kế: bán kính lạ, màu ngoài token, đổ bóng, chuyển sắc. |

---

## Kiến trúc

### Lá số được tính ngay tại máy

`src/lib/iztro.ts` bọc thư viện [iztro](https://github.com/SylarLong/iztro) —
nơi thực sự làm phần tử vi: đổi dương lịch sang âm lịch, mười hai cung, mười bốn
chính tinh, các vòng phụ tinh và tạp diệu, trạng thái miếu vượng, tứ hoá, cùng
các lớp đại vận và lưu niên. Không gọi mạng và không cần khoá.

**Lá số luôn được sinh ở `vi-VN`**, ở mọi ngôn ngữ. Việc dịch diễn ra lúc hiển
thị. Đây là lựa chọn có chủ ý: nó biến đầu ra tiếng Việt thành khoá nối cho mọi
thứ còn lại, và nhờ vậy đổi ngôn ngữ không bao giờ phải lập lại lá số.

`src/lib/branches.ts` giữ phần tính toán địa chi mà giao diện cần thêm ngoài
iztro — `xung()` cho cung đối, `tamHop()` cho hai đỉnh tam hợp — và đó chính là
thứ lớp phủ quan hệ vẽ ra. `src/lib/bazi.ts` bổ sung phần Bát Tự tuỳ chọn, đưa
vào prompt như một hệ thống phụ trợ.

### Bài luận giải gồm ba lớp prompt

`src/lib/gemini.ts` ghép một yêu cầu từ ba phần:

1. **Chỉ dẫn hệ thống** — phương pháp luận. Được gói vào một *context cache* của
   Gemini cùng với tệp PDF tham khảo (`astro-lens.pdf`), nên chỉ tải lên một lần
   thay vì gửi lại mỗi yêu cầu.
2. **Dữ liệu lá số** — lá số dưới dạng văn bản có nhãn, mọi giá trị đều đi qua
   bảng thuật ngữ, để mô hình phục vụ người đọc tiếng Hàn suy luận trên 자미 và
   명궁 chứ không phải trên Tử Vi và Mệnh.
3. **Nhiệm vụ** — chuỗi lập luận, danh sách tự kiểm, và khuôn mẫu đầu ra. Gửi lại
   ở mọi yêu cầu.

`src/lib/prompt/<locale>.ts` chứa cả ba, cho từng ngôn ngữ.
`src/lib/gemini-cache.ts` quản lý một cache cho mỗi ngôn ngữ.

Hai điều rất dễ sai ở lớp này, và cả hai đều đã từng gây hậu quả:

- **Sửa chỉ dẫn hệ thống không có tác dụng gì chừng nào cache còn tồn tại.**
  Cache chỉ được tìm theo *tên hiển thị*, không bao giờ so sánh nội dung, và TTL
  là 90 ngày. Quy tắc theo từng yêu cầu phải nằm ở lớp nhiệm vụ.
- **Phần có điều kiện phải bị xoá hẳn, chứ không phải khuyên đừng viết.** Phần
  Bát Tự và phần mô tả bản thân được bọc trong dấu `⟦BAZI⟧` / `⟦SELF⟧` và bị
  `renderTask()` cắt bỏ hoàn toàn khi không có dữ liệu. Câu lệnh "nếu không có
  dữ liệu thì bỏ qua phần này" đã được đo là bị bốn trong năm ngôn ngữ phớt lờ,
  rồi mô hình tự bịa ra dữ liệu.

### Dẫn chứng

Mỗi nhận định quan trọng trong bài luận giải đều kèm một dòng dẫn chứng nêu cung
và sao đứng sau nó. Trong bài luận giải, đó là các khối trích dẫn markdown, được
hiển thị thành những khối thụt vào thấy trong ảnh chụp. Trong phần hỏi đáp, dẫn
chứng ở cuối câu trả lời được `src/lib/citation.ts` tách ra và đặt trên một dòng
riêng, vì bong bóng chat cố ý không hiển thị khối trích dẫn.

Hai mặt dùng chung một bộ đọc markdown khối, `src/lib/markdown.ts`, nên tiêu đề
và danh sách trong câu trả lời được dàn ra chứ không hiện `###` và `*` nguyên
văn. Chúng chỉ khác nhau ở biến thể: `document` cho tiêu đề thật và khối dẫn
chứng `.sealq`; `bubble` biến tiêu đề thành một dòng dẫn in đậm đúng cỡ chữ của
bong bóng, và hiển thị dòng `>` như văn xuôi.

Một dẫn chứng có thể nêu hai cung — trong môn này, cung đối là một phần của căn
cứ — nên bất cứ đoạn mã nào phân tích dẫn chứng đều phải gán mỗi sao cho cung
đứng *ngay trước* nó, chứ không phải cho cung đầu tiên trong dòng.

### Đa ngôn ngữ

Ba loại văn bản, ba nơi khác nhau. Đặt nhầm loại này vào tệp của loại kia chính
là sai lầm mà cấu trúc này sinh ra để ngăn chặn:

| | Nằm ở | Quy tắc |
|---|---|---|
| Chuỗi giao diện | `src/lib/i18n/messages/<locale>.ts` | `vi.ts` là nguồn định kiểu; bốn tệp còn lại phải khớp đúng interface đó. |
| Thuật ngữ chuyên môn | `src/lib/i18n/vocabulary.ts` | Một bảng duy nhất, khoảng 193 khái niệm × 5 thứ tiếng, lấy từ chính dữ liệu ngôn ngữ của iztro chứ không viết theo trí nhớ. |
| Prompt của mô hình | `src/lib/prompt/<locale>.ts` | Ngôn ngữ chỉ dẫn, ngôn ngữ đầu ra và thuật ngữ đều đi theo người đọc. |

Luôn hiển thị giá trị chuyên môn qua `useI18n().v(value, domain)`, đừng dùng
giá trị thô.

**Xác định ngôn ngữ** diễn ra ở `src/proxy.ts` — tên mới của thứ trước đây là
`middleware.ts` trong Next 16. Thứ tự là `?lang=` → cookie → `Accept-Language` →
`vi`. Nó không bao giờ viết lại đường dẫn, nên mọi URL giữ nguyên như cũ, và
ngôn ngữ đã xác định được chuyển tới bước render qua một header.

### Hệ thống thiết kế là CSS, không phải utility class

Toàn bộ hệ thống thị giác nằm trong `src/app/globals.css` dưới dạng các lớp
thành phần có ngữ nghĩa — `.pal`, `.maj`, `.centre`, `.tl-row`, `.paper`,
`.sealq`, `.kv`, `.card`. Các component chỉ phát ra những tên lớp đó chứ không
dựng lại kiểu dáng tại chỗ. Tailwind có sẵn và dùng cho bố cục lẻ thì không sao,
nhưng **một bề mặt mới phải tái dùng một lớp thành phần đã có, hoặc thêm lớp mới
vào `globals.css`.**

Những điều không thoả hiệp đều được `./tests/tools/token-audit.sh` kiểm tra tự
động: đúng một bán kính (`3px`), không blur, không glow, không đổ bóng tạo độ
cao, không chữ chuyển sắc, màu chỉ lấy từ các biến CSS, và mọi thứ đếm hoặc ghi
ngày tháng đều dùng họ chữ đơn cách. Chạy lệnh rà này sau khi động vào style.

---

## Năm ngôn ngữ

`vi` (mặc định) · `zh-Hans` · `zh-Hant` · `ko` · `en`.

Hỗ trợ đi tới tận cùng. Giao diện, tên sao tên cung, và cả bài luận giải sinh ra
đều ở ngôn ngữ của người đọc — người dùng Hàn Quốc nhận một bài luận giải tiếng
Hàn suy luận trên tên sao tiếng Hàn, chứ không phải một lớp vỏ tiếng Hàn bọc
quanh bài tiếng Việt.

Đổi ngôn ngữ bằng `?lang=ko` (hoặc `zh-Hans`, `zh-Hant`, `en`, `vi`), hoặc bằng
bộ chọn trên thanh ứng dụng. Lựa chọn được ghi nhớ trong cookie.

---

## Kiểm thử

### `npm run test` — 245 kiểm thử đơn vị

Tính toán quan hệ giữa các cung, ánh xạ địa chi, tiến độ đại vận, tính đầy đủ
của bảng thuật ngữ, cấu trúc các gói prompt, biến thể bản in, và các bộ kiểm tra
chất lượng bài luận giải. Không cần mạng. Đây là lệnh bạn chạy liên tục.

Lưu ý rằng **bản thân các bộ kiểm tra của eval cũng được kiểm thử đơn vị**, bằng
những bài luận giải giả có lỗi cố ý. Đừng bao giờ tốn một lần gọi API chỉ để
chứng minh một bộ kiểm tra chạy đúng.

### `npm run eval` — chất lượng bài luận giải

Đây là thứ kiểm tra những gì mô hình *thực sự nói*, đối chiếu với chính lá số đã
đưa cho nó. Nó chạy hai lá số chuẩn đã đóng băng × năm ngôn ngữ = mười bài luận
giải thật.

> **Tốn khoảng 20 phút và tiền API thật.** Nó cố ý không nằm trong
> `npm run test` và không bao giờ được thêm vào CI.

Năm bộ kiểm tra tất định, tất cả đều hoạt động ở mọi ngôn ngữ nhờ đi qua bảng
thuật ngữ thay vì khớp chuỗi tiếng Việt:

| Kiểm tra | Xác minh điều gì |
|---|---|
| 1 · bịa đặt | **Vị trí sao.** Mọi chính tinh mà bài luận giải đặt vào một cung đều phải thật sự ở cung đó, có chấp nhận sao mượn cho cung vô chính diệu. Không phải câu hỏi "sao này có trên lá số không" — một lá số đầy đủ đã đặt cả hai mươi tám chính tinh và phụ tinh ở đâu đó rồi, nên câu hỏi ấy vô nghĩa. |
| 2 · độ bao phủ | Cả mười hai cung đều thật sự được luận. |
| 3 · ngôn ngữ | Bài viết đúng hệ chữ của người đọc, và không sót tiếng Việt lọt ra từ phần dữ liệu lá số. |
| 4 · độ dài | Bài đạt độ dài mà chính prompt của nó yêu cầu. |
| 5 · cấu trúc | Các phần đánh số có đủ và đúng thứ tự, phần có điều kiện chỉ xuất hiện khi có dữ liệu tương ứng, và các phần nhận định đều có dẫn chứng. |

Vài tuỳ chọn hữu ích: `--locale`, `--chart`, `--tag`, và `--reuse` — chạy lại
các bộ kiểm tra trên những bài đã lưu mà **không** gọi API lần nào. Bài luận giải
được ghi vào `tests/eval/out/<tag>/`. [EVAL.md](EVAL.md) là bản ghi chép những gì
các lần chạy trước đã tìm ra, gồm cả các phép đo dẫn tới việc viết lại vài bộ
kiểm tra.

### `npm run parity` — độ trung thực thị giác

Mười hai màn hình được render và đối chiếu với một bản thiết kế tham chiếu đã
đóng băng, ở hai khổ màn hình, kèm hai mươi bài kiểm tra sức chịu bố cục theo
từng ngôn ngữ và một bộ giảm chuyển động.

**Tiêu chí quyết định là hình học, không phải điểm ảnh.** Bộ kiểm tra có báo tỉ
lệ điểm ảnh khác nhau, nhưng con số đó chỉ là chỉ báo gần đúng, và một số màn
hình vượt ngưỡng 0,5% một cách hoàn toàn chính đáng. Thứ thực sự quyết định là
các *hộp* có trùng khớp hay không — vị trí, kích thước và khoảng cách của từng
phần tử trong danh sách bộ chọn của mỗi màn hình — vì điều đó độc lập với cách
một chữ cái được tô điểm ảnh. [PARITY.md](PARITY.md) ghi lại mọi phép đo, mọi
sai lệch đã được chấp nhận và lý do của chúng. **Hãy đọc nó trước khi thay đổi
bất cứ thứ gì về mặt thị giác**; nhiều thứ trông như "lỗi" thật ra là quyết định
có chủ ý, có lịch sử đằng sau.

Bộ kiểm tra sẽ dừng mọi dev server đang chạy và tự khởi động server riêng, vì
Next 16 chỉ cho phép một dev server cho mỗi thư mục dự án, và nếu không làm vậy
Turbopack sẽ phục vụ một biểu định kiểu cũ cho trình duyệt không giao diện.

### Lá số mẫu dành cho phát triển

`?fixture=tuvi-ty` trên `/` hoặc `/result` nạp một lá số sách giáo khoa đã đóng
gói sẵn từ `src/lib/fixture.ts`, kèm một bài luận giải viết trước, với ngày tham
chiếu của đại vận được ghim lại để các ảnh chụp không mục theo mốc giao năm. Đó
là cách các màn hình đối chiếu và ảnh chụp trong README giữ được tính tái lập.

`loadFixture` trả về `null` khi `NODE_ENV === 'production'`, nên không thể chạm
tới nó trong bản đã triển khai.

---

## Hạn chế và những chỗ còn thô

Đây là những điều có thật và vẫn đang đúng. Không có gì bí ẩn cả; chúng được ghi
ra để bạn khỏi phải tự phát hiện lại.

- **Một bài luận giải đầy đủ mất khoảng ba phút.** Đó là một lần sinh văn bản
  dài, có cấu trúc, với mức suy luận cao. Giao diện có hiển thị trạng thái chờ;
  không có cách nào làm nhanh hơn mà không làm bài ngắn đi.
- **Đổi tên hiển thị của cache sẽ bỏ rơi cache cũ.** Gemini chỉ tìm context cache
  theo tên hiển thị, nên đổi `CACHE_DISPLAY_NAME` trong
  `src/lib/gemini-cache.ts` sẽ âm thầm bỏ lại các cache 90 ngày đang có và buộc
  tệp PDF tham khảo tải lên lại. Bài luận giải đầu tiên ở mỗi ngôn ngữ sẽ chậm
  hơn cho tới khi cache ấm lại. Đây đúng là điều đã xảy ra khi dự án được đổi
  tên thành `astro-lens`.
- **`npm run lint` báo ba lỗi và đó là trạng thái bình thường.** Đó là ba lỗi
  `@typescript-eslint/no-explicit-any` có sẵn từ trước trong
  `src/app/api/candidates/route.ts` (dòng 35, 38, 41). Lint được coi là "sạch"
  khi chỉ còn đúng ba lỗi đó. Bất cứ thứ gì khác là do bạn.
- **`next build` và `next dev` dùng chung `.next`.** Chạy build rồi chạy dev
  server trong cùng thư mục có thể khiến dev server trả 404 cho mọi route.
  `rm -rf .next` rồi khởi động lại.
- **Phông CJK nạp từ biểu định kiểu Google Fonts, không phải `next/font`.**
  `next/font/google` không có tập con CJK cho họ Noto và sẽ tự lưu trữ từng lát
  unicode-range lúc build. Layout gốc nạp một biểu định kiểu cho ngôn ngữ đang
  dùng, phía sau là ngăn xếp phông CJK của hệ thống.
- **Dấu tiếng Việt cần cẩn thận.** Phông phải nạp tập con `vietnamese`, và một
  `overflow: hidden` trần trụi đặt lên chữ tiếng Việt có hoạt ảnh sẽ cắt mất dấu
  nặng và dấu hỏi — hãy dùng cặp padding / margin âm đã có sẵn trong
  `globals.css`.
- **Mã hoá TOON đã thử và đã gỡ.** [EVAL.md](EVAL.md) §4 giữ số đo: nó nén phần
  dữ liệu lá số 22,6%, nhưng phần đó chỉ chiếm 4,3% của prompt, nên cả lệnh gọi
  chỉ nhúc nhích 1,79% và thời gian thực không đổi chút nào. Hãy đọc §4 trước
  khi tính chuyện làm lại.

---

## Bố cục kho mã

```
src/
  app/                 Next App Router — các trang và ba route API
    api/analyze/       sinh bài luận giải
    api/chat/          hỏi đáp tiếp nối
    api/candidates/    các lá số khi không biết giờ sinh
  components/
    chart/             lưới lá số, ngăn chi tiết, bảng đại vận, bài luận giải
    chat/              khung hỏi đáp
    ui/                biểu mẫu, header, footer, màn hình chờ
  lib/
    iztro.ts           lập lá số
    bazi.ts            Bát Tự tuỳ chọn
    branches.ts        tính xung chiếu / tam hợp
    chart-derived.ts   sao mượn cho cung vô chính diệu
    rel-overlay.ts     đường nối quan hệ giữa các cung
    citation.ts        tách dẫn chứng khỏi câu trả lời hỏi đáp
    markdown.ts        bộ đọc markdown khối dùng chung hai mặt
    gemini.ts          ghép prompt
    gemini-cache.ts    context cache theo từng ngôn ngữ
    prompt/            năm gói prompt
    i18n/              chuỗi giao diện, thuật ngữ, xác định ngôn ngữ
    fixture.ts         lá số mẫu
  proxy.ts             xác định ngôn ngữ (middleware của Next 16)
tests/
  unit/                vitest
  parity/              đối chiếu thị giác bằng Playwright
  eval/                bộ đo chất lượng bài luận giải
  tools/               chụp màn hình, xuất PDF, rà a11y và design token
```

Đọc thêm, tất cả đều nằm trong kho này: [AGENTS.md](AGENTS.md) cho các quy ước
nên biết trước khi sửa bất cứ thứ gì, [PARITY.md](PARITY.md) cho hồ sơ thị giác
và các quyết định đã chốt, và [EVAL.md](EVAL.md) cho những gì đầu ra của mô hình
đã thực sự được đo là làm được.
