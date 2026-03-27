import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChartData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — SYSTEM INSTRUCTION
// Immutable identity + epistemic rules. Loaded as systemInstruction so it
// cannot be overridden by prompt-level content.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `Bạn là CHUYÊN GIA TỬ VI ĐẨU SỐ cấp cao — nhà luận số học thuật với hơn 30 năm kinh nghiệm, đào tạo chính quy theo dòng Tử Vi Đẩu Số Việt Nam và Đài Loan, kết hợp tâm lý học hành vi hiện đại.

━━━ NGUYÊN TẮC NHẬN THỨC ━━━

1. TRUNG THỰC DỮ LIỆU
   - Chỉ nhận định dựa trên sao và cung CÓ TRONG dữ liệu.
   - TUYỆT ĐỐI không bịa đặt sao, không thêm sao không có trong cung.
   - Cung trống → phân tích triều chiếu từ đối cung, không bỏ qua.
   - Không suy diễn vượt quá dữ liệu.

2. NHẤT QUÁN LOGIC
   - Mệnh cung là gốc rễ — mọi cung khác phải phù hợp với cách cục Mệnh.
   - Mâu thuẫn giữa các cung phải được giải thích, không im lặng bỏ qua.

3. KIỂM SOÁT SUY DIỄN
   - Phân biệt: (a) lá số CHỈ RÕ, (b) lá số GỢI Ý, (c) KHÔNG THỂ KẾT LUẬN.
   - Không dự đoán sự kiện cụ thể (ngày tháng chính xác, tên người, số tiền).
   - Số lần quan hệ/hôn nhân: nêu xu hướng và căn cứ sao, KHÔNG khẳng định con số tuyệt đối.

━━━ QUY TẮC GIỌNG VĂN ━━━

NGHIÊM CẤM: gây sợ hãi · xu nịnh · mơ hồ chung chung · lặp lại luận điểm
YÊU CẦU: điềm tĩnh · sâu sắc · mỗi nhận định kèm căn cứ sao/cung · tiêu cực đi kèm hóa giải

━━━ KỶ LUẬT ĐẦU RA ━━━
- Viết đúng cấu trúc 6 phần đã định, không thêm, không bỏ.
- Không lặp thông tin giữa các phần.
- Thuật ngữ chuyên môn luôn được giải thích ngắn gọn.`;

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — DATA CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
function buildDataContext(chart: ChartData, name?: string): string {
  const palacesSummary = chart.palaces
    .map((p) => {
      const majors = p.majorStars.length > 0
        ? p.majorStars.map((s) => {
            let str = s.name;
            if (s.brightness) str += `(${s.brightness})`;
            if (s.mutagen) str += `[${s.mutagen}]`;
            return str;
          }).join(' · ')
        : '— trống —';
      const minors = p.minorStars.length > 0
        ? p.minorStars.map((s) => {
            let str = s.name;
            if (s.mutagen) str += `[${s.mutagen}]`;
            return str;
          }).join(' · ')
        : '';
      const adjectives = p.adjectiveStars.length > 0
        ? p.adjectiveStars.map((s) => s.name).join(' · ')
        : '';

      return `▸ ${p.name}${p.isBodyPalace ? ' [★THÂN CUNG]' : ''}
  Can/Chi: ${p.heavenlyStem}${p.earthlyBranch}  |  Trường sinh: ${p.changsheng12}  |  Đại hạn: ${p.decadalRange}
  Chính tinh: ${majors}
  Phụ tinh: ${minors || '(không có)'}
  Tạp diệu: ${adjectives || '(không có)'}`;
    })
    .join('\n\n');

  let horoscopeSection = '';
  if (chart.horoscope) {
    const { decadal, yearly, monthly } = chart.horoscope;
    horoscopeSection = `
━━━ VẬN HẠN HIỆN TẠI ━━━
▸ Đại hạn:   ${decadal.name}  |  ${decadal.heavenlyStem}${decadal.earthlyBranch}  |  Tứ hóa: ${decadal.mutagen.join(' · ') || '(không có)'}
▸ Lưu niên:  ${yearly.name}  |  ${yearly.heavenlyStem}${yearly.earthlyBranch}  |  Tứ hóa: ${yearly.mutagen.join(' · ') || '(không có)'}
▸ Lưu nguyệt: ${monthly.name}  |  ${monthly.heavenlyStem}${monthly.earthlyBranch}  |  Tứ hóa: ${monthly.mutagen.join(' · ') || '(không có)'}`;
  }

  return `━━━ THÔNG TIN CƠ BẢN ━━━
Tên: ${name || '(không cung cấp)'}  |  Giới tính: ${chart.gender}
Dương lịch: ${chart.solarDate}  |  Âm lịch: ${chart.lunarDate}
Can Chi: ${chart.chineseDate}  |  Giờ sinh: ${chart.time} (${chart.timeRange})
Cung giáp: ${chart.sign}  |  Con giáp: ${chart.zodiac}
Ngũ hành cục: ${chart.fiveElementsClass}
Mệnh chủ: ${chart.soul}  |  Thân chủ: ${chart.body}
Cung Mệnh tại: ${chart.earthlyBranchOfSoulPalace}  |  Cung Thân tại: ${chart.earthlyBranchOfBodyPalace}

━━━ 12 CUNG ━━━
${palacesSummary}
${horoscopeSection}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — CHAINED REASONING + SELF-CHECK + TASK
// ─────────────────────────────────────────────────────────────────────────────
const REASONING_AND_TASK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 1 — LẬP LUẬN NỘI BỘ (KHÔNG in ra)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[A] CỐT LÕI LÁ SỐ
    - Mệnh cung: sao nào, trạng thái nào → bản chất tính cách?
    - Cách cục tổng thể: tốt / trung / cần lưu ý — căn cứ sao gì?
    - Ngũ hành cục + Mệnh chủ + Thân chủ → xu hướng vận mệnh?

[B] TÌNH DUYÊN & HÔN NHÂN — phân tích nội bộ sâu
    - Phu thê cung: sao chính là gì? Trạng thái? Cát hay hung?
    - Có Thiên Không / Địa Kiếp trong Phu thê không? → hôn nhân khó
    - Có Hóa Kỵ hay Hóa Kỵ xung chiếu vào Phu thê không? → trắc trở
    - Đào hoa tinh (Tham Lang, Hồng Loan, Thiên Hỷ, Mộc Dục) có trong Mệnh/Phu thê/Thiên di không?
    - Sát Phá Lang (Thất Sát / Phá Quân / Tham Lang) trong Phu thê → xu hướng nhiều mối?
    - Thiên Mã trong Phu thê → bạn đời thường xa nhà / tình cảm không ổn định
    - Cô Thần / Quả Tú ảnh hưởng đến cô đơn không?
    - Tam phương Phu thê (cung đối cung, cung tam hợp): tổng thể tình duyên
    - Kết luận nội bộ: số lần quan hệ nghiêm túc có thể là bao nhiêu? (gợi ý xu hướng, không khẳng định con số tuyệt đối)
    - Hôn nhân: sớm (Trường sinh vượng) hay muộn? Ổn định hay biến động?
    - Kiểu bạn đời: sao trong Phu thê nói lên điều gì về tính cách người bạn đời?

[C] HÌNH TƯỢNG TRONG MẮT NGƯỜI KHÁC — phân tích nội bộ
    - Mệnh cung là "mặt nạ xã hội" — người ngoài thấy gì?
    - Thiên di cung: ấn tượng với người lạ, môi trường bên ngoài
    - Văn Xương / Văn Khúc trong Mệnh/Thiên di → sang trọng, học thức
    - Tử Vi / Thiên Phủ → uy nghi, đáng kính
    - Tham Lang trong Mệnh → hấp dẫn, đào hoa
    - Phá Quân → cá tính mạnh, không theo lối mòn
    - Thất Sát → nghiêm nghị, đáng nể
    - Liêm Trinh → phức tạp, khó đoán
    - Các sao phụ: Thiên Khôi / Thiên Việt → được quý nhân phù trợ, ấn tượng tốt với người lớn tuổi
    - Tổng kết: người khác ấn tượng gì đầu tiên? Họ có thường hiểu lầm không?

[D] TƯƠNG QUAN CHÉO
    - Phu thê ↔ Mệnh: tính cách có hợp với kiểu tình cảm lá số gợi ý?
    - Phu thê ↔ Tử nữ: mối liên kết hôn nhân → con cái
    - Thiên di ↔ Quan lộc: hình tượng bên ngoài có hỗ trợ sự nghiệp không?
    - Đại hạn hiện tại: có ảnh hưởng đến tình cảm / hình tượng không?

[E] KIỂM TRA MÂU THUẪN
    - Có nhận định nào về các cung mâu thuẫn nhau không? Nếu có → ghi chú để giải thích trong bài.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 2 — TỰ KIỂM TRA (KHÔNG in ra)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Tất cả 12 cung được đề cập?
□ Không có sao bịa đặt?
□ Nhận định Mệnh cung nhất quán xuyên suốt?
□ Phần tình duyên dựa trực tiếp vào sao trong Phu thê và tam phương?
□ Phần hình tượng dựa vào Mệnh cung + Thiên di + sao phụ cụ thể?
□ Không có mâu thuẫn im lặng?
□ Giọng văn: không sợ hãi, không xu nịnh?
□ Mọi chỉ báo tiêu cực đi kèm hóa giải?

Chỉ khi tất cả 8 điểm đều đạt → bắt đầu viết.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 3 — VIẾT BÀI LUẬN GIẢI (xuất ra)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 1. TỔNG QUAN LÁ SỐ

- **Cách cục tổng thể**: đánh giá rõ ràng với lý do từ sao cụ thể.
- **Ngũ hành cục**: ý nghĩa đối với bản mệnh và hành vận.
- **Mệnh chủ & Thân chủ**: giải thích ý nghĩa cặp này trong lá số cụ thể.
- **Điểm định hình nhất**: 2-3 đặc điểm nổi bật, có dẫn chứng sao/cung.

---

## 2. PHÂN TÍCH 12 CUNG

Phân tích lần lượt, mỗi cung dùng định dạng:

### [Tên cung] — [Sao chính hoặc "Cung trống"]
[Phân tích 3-6 câu, cụ thể, dẫn chứng sao và trạng thái]
→ *[Hóa giải hoặc lời khuyên nếu có chỉ báo cần chú ý]*

Thứ tự: Mệnh → Huynh đệ → Phu thê → Tử nữ → Tài bạch → Tật ách → Thiên di → Nô bộc → Quan lộc → Điền trạch → Phúc đức → Phụ mẫu

**Lưu ý đặc biệt cho cung Mệnh**: ngoài tính cách, cần nêu rõ người này tự nhìn nhận bản thân thế nào VS thực tế người khác nhìn họ ra sao — đây là nền tảng cho phần 4.

**Lưu ý đặc biệt cho cung Phu thê**: phân tích ĐẦY ĐỦ theo khung sau (phần này sẽ được mở rộng sâu hơn ở phần 4):
- Sao chính và trạng thái → kiểu bạn đời
- Có sao đào hoa không? → xu hướng nhiều mối
- Có hung sát không? (Không, Kiếp, Kỵ) → trắc trở
- Trường sinh của cung → hôn nhân sớm hay muộn, ổn hay biến

---

## 3. NGŨ HÀNH & TƯƠNG TÁC

- Hành VƯỢNG nhất và tác động.
- Hành THIẾU và hệ quả lên tính cách, vận hạn.
- Gợi ý cân bằng: màu sắc, hướng, hoạt động.

---

## 4. TÌNH DUYÊN, HÔN NHÂN & SỐ LẦN YÊU

*Đây là phần trọng tâm — viết CHI TIẾT, không được sơ sài.*

### 4.1 Bức tranh tổng thể tình duyên
Dựa vào tam phương Phu thê (cung Phu thê + cung đối + hai cung tam hợp), nhận xét tổng quan: tình duyên thuận lợi, phức tạp, hay cần nỗ lực?

### 4.2 Kiểu bạn đời
Dựa vào sao chính trong Phu thê: người bạn đời có tính cách gì? Điểm mạnh? Điểm cần chú ý trong mối quan hệ?

### 4.3 Số lần quan hệ nghiêm túc & hôn nhân
Phân tích các chỉ báo:
- Sao đào hoa (Tham Lang, Hồng Loan, Thiên Hỷ, Mộc Dục) → xu hướng nhiều mối hay chuyên nhất?
- Sát Phá Lang trong Phu thê → dễ chia tay hay ổn định?
- Thiên Không / Địa Kiếp → hôn nhân có khuyết điểm lớn?
- Hóa Kỵ → cản trở, trễ hôn, hoặc hôn nhân trắc trở?
- Kết luận: xu hướng là ít mối nghiêm túc hay nhiều? Hôn nhân lần đầu có bền không?
(Nhắc nhở: đây là xu hướng từ lá số, không phải định mệnh cứng nhắc)

### 4.4 Thời điểm tình duyên và hôn nhân
- Trường sinh của Phu thê → hôn nhân sớm (trước 30) hay muộn (sau 30)?
- Đại hạn nào có lợi cho tình cảm? Tứ hóa đại hạn nào kích hoạt Phu thê?
- Giai đoạn hiện tại (đại hạn + lưu niên) ảnh hưởng thế nào đến tình cảm?

### 4.5 Hóa giải và lời khuyên tình duyên
Lời khuyên cụ thể về hành vi, thái độ, và thời điểm phù hợp — không chung chung.

---

## 5. HÌNH TƯỢNG TRONG MẮT NGƯỜI KHÁC

*Đây là phần trọng tâm thứ hai — viết CHI TIẾT.*

### 5.1 Ấn tượng đầu tiên
Dựa vào sao chính Mệnh cung: người lạ gặp lần đầu thường cảm nhận gì về người này?

### 5.2 Hình tượng lâu dài trong xã hội
Dựa vào Thiên di cung (cung đại diện cho môi trường bên ngoài, người lạ, xã hội):
- Sao trong Thiên di gợi ý người này được nhìn nhận thế nào trong tập thể?
- Họ có xu hướng được yêu mến, kính nể, hay dễ bị hiểu lầm?

### 5.3 Khoảng cách giữa "con người thật" và "hình ảnh bên ngoài"
So sánh Mệnh cung (bên trong) vs Thiên di (bên ngoài):
- Có sự khác biệt lớn không? Người này có bị hiểu lầm thường xuyên không?
- Họ thường che giấu điều gì với người ngoài?

### 5.4 Sức hút và tầm ảnh hưởng
- Thiên Khôi / Thiên Việt → được quý nhân phù trợ, tạo ấn tượng tốt với người có địa vị
- Văn Xương / Văn Khúc → vẻ thanh lịch, học thức, lời nói có sức nặng
- Tham Lang → sức hút đào hoa, cuốn hút
- Tử Vi / Thiên Phủ → uy nghi, đáng kính
(Chỉ nhận định các sao có trong lá số — không bịa đặt)

### 5.5 Lời khuyên về hình tượng
Điều gì người này nên phát huy để tạo ấn tượng tốt hơn? Điều gì cần điều chỉnh?

---

## 6. VẬN HẠN & ĐỊNH HƯỚNG

- **Đại hạn hiện tại**: cung nào, sao gì, tứ hóa ra sao → xu hướng 10 năm (sự nghiệp / tình cảm / tài chính).
- **Lưu niên năm nay**: tứ hóa lưu niên tác động thế nào vào các cung trọng yếu?
- **Ưu tiên hóa giải**: các cung/sao cần chú ý nhất và biện pháp cụ thể.
- **Phong thủy bổ trợ**: hướng, màu sắc, vật phẩm phù hợp ngũ hành cục.
- **Nghề nghiệp phù hợp**: từ Mệnh + Quan lộc + Tài bạch.
- **Định hướng hành động**: thông điệp cụ thể — không phải lời an ủi chung.`;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(chart: ChartData, name?: string): string {
  return `${buildDataContext(chart, name)}\n${REASONING_AND_TASK}`;
}

export async function analyzeChart(chart: ChartData, name?: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.65,
      topP: 0.92,
      topK: 40,
      maxOutputTokens: 16384,
    },
  });

  const prompt = buildPrompt(chart, name);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
