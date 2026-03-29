import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChartData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — SYSTEM INSTRUCTION
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
   - Thời gian hiện tại được cung cấp — dùng để xác định đại hạn, lưu niên đang hoạt động, KHÔNG tự tính lại.

3. KIỂM SOÁT SUY DIỄN
   - Phân biệt: (a) lá số CHỈ RÕ, (b) lá số GỢI Ý, (c) KHÔNG THỂ KẾT LUẬN.
   - Không dự đoán sự kiện cụ thể (ngày tháng chính xác, tên người, số tiền).
   - Số lần quan hệ/hôn nhân: nêu xu hướng, KHÔNG khẳng định con số tuyệt đối.

━━━ QUY TẮC GIỌNG VĂN ━━━

NGHIÊM CẤM: gây sợ hãi · xu nịnh · mơ hồ chung chung · lặp lại luận điểm
YÊU CẦU: điềm tĩnh · sâu sắc · mỗi nhận định kèm căn cứ sao/cung · tiêu cực đi kèm hóa giải

━━━ KỶ LUẬT ĐẦU RA ━━━
- Viết đúng cấu trúc 7 phần đã định, không thêm, không bỏ.
- Không lặp thông tin giữa các phần.
- Thuật ngữ chuyên môn luôn được giải thích ngắn gọn.
- Mỗi cung phân tích ĐẦY ĐỦ ngay từ đầu, không sơ sài.`;

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

  // Inject real current time so the model knows the exact year
  const now = new Date();
  const currentDateTime = now.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return `━━━ THỜI GIAN HIỆN TẠI ━━━
${currentDateTime} (GMT+7 — Việt Nam)

━━━ THÔNG TIN CƠ BẢN ━━━
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
    - Mệnh cung: sao chính, trạng thái, cách cục tổng thể?
    - Ngũ hành cục + Mệnh chủ + Thân chủ → xu hướng vận mệnh?

[B] TÌNH DUYÊN — phân tích nội bộ
    - Phu thê cung: sao chính, trạng thái, cát hay hung?
    - Có đào hoa tinh không? (Tham Lang, Hồng Loan, Thiên Hỷ, Mộc Dục)
    - Sát Phá Lang trong Phu thê? Thiên Không/Địa Kiếp? Hóa Kỵ?
    - Thiên Mã trong Phu thê? Cô Thần/Quả Tú ảnh hưởng gì?
    - Tam phương Phu thê: tình duyên thuận hay nghịch?
    - Xu hướng số lần quan hệ nghiêm túc — dựa trên sao gì?
    - Hôn nhân sớm hay muộn? Kiểu bạn đời?

[C] SỰ NGHIỆP — phân tích nội bộ
    - Quan lộc cung: sao chính, trạng thái, ngành nghề phù hợp?
    - Thiên di (quý nhân bên ngoài, cơ hội xa xứ) hỗ trợ hay cản Quan lộc?
    - Có Hóa Lộc / Hóa Khoa / Hóa Quyền trong Quan lộc không? → thăng tiến
    - Có Hóa Kỵ / sát tinh không? → chướng ngại nghề nghiệp
    - Đại hạn hiện tại rơi vào cung liên quan sự nghiệp không?
    - Người này phù hợp làm chủ hay làm công? Sáng tạo hay hành chính?

[D] TÀI CHÍNH — phân tích nội bộ
    - Tài bạch cung: sao chính, trạng thái — tài năng kiếm tiền?
    - Cách kiếm tiền: chủ động (buôn bán, sáng tạo) hay thụ động (lương, đầu tư)?
    - Có Hóa Lộc / Thiên Lộc trong Tài bạch không? → giàu có, tài vận mạnh
    - Có Thiên Không / Địa Kiếp / Hóa Kỵ trong Tài bạch? → hao tán, thất bại tài chính
    - Điền trạch (bất động sản, tích lũy) hỗ trợ hay tiêu hao Tài bạch?
    - Tài bạch ↔ Quan lộc: sự nghiệp và thu nhập có nhất quán không?

[E] HÌNH TƯỢNG — phân tích nội bộ
    - Mệnh cung: người ngoài thấy gì ở người này?
    - Thiên di: ấn tượng với người lạ, xã hội?
    - Khoảng cách giữa bên trong và bên ngoài?

[F] TƯƠNG QUAN CHÉO & MÂU THUẪN
    - Phu thê ↔ Mệnh: tính cách có hợp kiểu tình cảm không?
    - Tài bạch ↔ Quan lộc: nhất quán hay mâu thuẫn?
    - Thiên di ↔ Quan lộc: cơ hội bên ngoài hỗ trợ sự nghiệp?
    - Đại hạn hiện tại: tác động tổng thể đến tình cảm/nghề nghiệp/tài chính?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BƯỚC 2 — TỰ KIỂM TRA (KHÔNG in ra)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Tất cả 12 cung được phân tích đủ chiều sâu?
□ Không có sao bịa đặt?
□ Nhận định Mệnh cung nhất quán xuyên suốt?
□ Phần tình duyên dựa trực tiếp vào sao Phu thê + tam phương?
□ Phần sự nghiệp dựa vào Quan lộc + Thiên di + tứ hóa?
□ Phần tài chính dựa vào Tài bạch + Điền trạch + tứ hóa?
□ Không có mâu thuẫn im lặng giữa các cung?
□ Giọng văn: không sợ hãi, không xu nịnh?
□ Mọi chỉ báo tiêu cực đi kèm hóa giải cụ thể?

Chỉ khi tất cả 9 điểm đều đạt → bắt đầu viết.

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

## 2. PHÂN TÍCH 12 CUNG CHI TIẾT

Phân tích lần lượt toàn bộ 12 cung. Mỗi cung dùng định dạng:

### [Tên cung] — [Sao chính hoặc "Cung trống — nhận chiếu từ [đối cung]"]

Phân tích theo khung sau (không cần hiển thị số thứ tự, viết tự nhiên):
- **Sao và trạng thái**: sao chính ở trạng thái nào (miếu/vượng/đắc/bình/hãm)? Ý nghĩa trực tiếp?
- **Tương tác các sao**: các sao phụ và tạp diệu bổ sung hoặc xung khắc gì?
- **Tam phương tứ chính**: cung đối và cung tam hợp nói lên điều gì bổ sung (nếu quan trọng)?
- **Biểu hiện thực tế**: điều này ảnh hưởng thế nào đến lĩnh vực của cung trong cuộc sống hàng ngày?
- **Điểm cần lưu ý**: chỉ báo tiêu cực (nếu có) và cách hóa giải cụ thể.

→ *[Tóm tắt một câu: điểm mạnh hoặc lời khuyên chính cho cung này]*

**Thứ tự bắt buộc:**
1. Mệnh — tính cách, bản chất, cách người khác nhìn nhận
2. Huynh đệ — anh chị em, bạn thân, mạng lưới xã hội gần
3. Phu thê — tình cảm, hôn nhân, mối quan hệ đôi lứa
4. Tử nữ — con cái, sáng tạo, học trò
5. Tài bạch — tài chính, thu nhập, cách kiếm và giữ tiền
6. Tật ách — sức khỏe, tâm lý, bệnh tật tiềm ẩn
7. Thiên di — di chuyển, cơ hội xa xứ, quý nhân bên ngoài
8. Nô bộc — bạn bè, cấp dưới, đối tác, đồng nghiệp
9. Quan lộc — sự nghiệp, công danh, hướng phát triển
10. Điền trạch — nhà cửa, bất động sản, tích lũy tài sản
11. Phúc đức — phúc phận, đời sống tinh thần, phúc ấm tổ tiên
12. Phụ mẫu — cha mẹ, cấp trên, sức khỏe cha mẹ

---

## 3. NGŨ HÀNH & TƯƠNG TÁC

- Hành VƯỢNG nhất và tác động lên tính cách, vận hạn.
- Hành THIẾU và hệ quả lên cuộc sống.
- Gợi ý cân bằng: màu sắc, hướng, hoạt động phù hợp.

---

## 4. TÌNH DUYÊN, HÔN NHÂN & SỐ LẦN YÊU

*Phần trọng tâm — viết chi tiết, không sơ sài.*

### 4.1 Bức tranh tổng thể tình duyên
Từ tam phương Phu thê: tình duyên thuận lợi, phức tạp, hay cần nỗ lực?

### 4.2 Kiểu bạn đời
Từ sao trong Phu thê: bạn đời có tính cách gì? Điểm mạnh? Điểm cần chú ý?

### 4.3 Xu hướng số lần quan hệ nghiêm túc và hôn nhân
Phân tích các chỉ báo cụ thể:
- Đào hoa tinh (Tham Lang, Hồng Loan, Thiên Hỷ, Mộc Dục): xu hướng nhiều mối hay chuyên nhất?
- Sát Phá Lang trong Phu thê: dễ chia tay hay ổn định?
- Thiên Không / Địa Kiếp: hôn nhân có khuyết điểm lớn?
- Hóa Kỵ: cản trở, trễ hôn, hôn nhân trắc trở?
- **Kết luận xu hướng** (nhắc nhở: đây là xu hướng, không phải định mệnh cứng nhắc)

### 4.4 Thời điểm và hóa giải
- Trường sinh Phu thê: hôn nhân sớm hay muộn?
- Đại hạn nào có lợi cho tình cảm?
- Giai đoạn hiện tại ảnh hưởng thế nào đến tình cảm?
- Lời khuyên hành vi cụ thể.

---

## 5. SỰ NGHIỆP & CÔNG DANH

*Phần trọng tâm — viết chi tiết, không sơ sài.*

### 5.1 Bức tranh sự nghiệp tổng thể
Từ Quan lộc cung: cách cục sự nghiệp thuận hay nhiều chướng ngại?

### 5.2 Ngành nghề và vai trò phù hợp
- Sao chính Quan lộc gợi ý lĩnh vực nào? (Tử Vi → lãnh đạo, quản lý; Vũ Khúc → tài chính, kỹ thuật; Thiên Cơ → tư vấn, chiến lược; Tham Lang → nghệ thuật, giao tiếp, v.v.)
- Làm chủ hay làm công? Sáng tạo độc lập hay quản lý tập thể?
- Thiên di hỗ trợ: cơ hội phát triển xa xứ, quý nhân nghề nghiệp?

### 5.3 Cơ hội và chướng ngại
- Hóa Lộc / Hóa Khoa / Hóa Quyền trong Quan lộc: thăng tiến, danh tiếng?
- Hóa Kỵ / sát tinh: chướng ngại nào cần cẩn thận?
- Nô bộc (đồng nghiệp, đối tác): hỗ trợ hay gây trở ngại?

### 5.4 Vận nghề nghiệp trong giai đoạn hiện tại
- Đại hạn + lưu niên hiện tại tác động thế nào đến sự nghiệp?
- Thời điểm thuận lợi nhất để thay đổi hoặc thăng tiến?

### 5.5 Lời khuyên sự nghiệp
3 hành động cụ thể người này nên làm để phát triển nghề nghiệp.

---

## 6. TÀI CHÍNH & TÀI SẢN

*Phần trọng tâm — viết chi tiết, không sơ sài.*

### 6.1 Tài năng kiếm tiền
Từ Tài bạch cung: người này có duyên với tiền không? Kiếm tiền dễ hay khó?

### 6.2 Cách kiếm và giữ tiền
- Kiếm tiền chủ động (buôn bán, sáng tạo, kinh doanh) hay thụ động (lương, đầu tư)?
- Hóa Lộc / Thiên Lộc trong Tài bạch: giàu có, tài vận mạnh?
- Điền trạch: khả năng tích lũy bất động sản, tài sản dài hạn?

### 6.3 Rủi ro tài chính
- Thiên Không / Địa Kiếp / Hóa Kỵ trong Tài bạch: hao tán, đầu tư thất bại?
- Xu hướng tiêu xài: biết giữ tiền hay dễ mất tiền?
- Cạm bẫy tài chính cần tránh dựa trên lá số.

### 6.4 Tài bạch ↔ Quan lộc
Sự nghiệp và thu nhập có nhất quán không? Thu nhập chính đến từ đâu?

### 6.5 Vận tài chính giai đoạn hiện tại
- Đại hạn + lưu niên: giai đoạn này tài chính thuận hay nghịch?
- Thời điểm nên đầu tư, mở rộng / nên thận trọng, giữ vốn?
- 3 lời khuyên tài chính cụ thể cho giai đoạn này.

---

## 7. HÌNH TƯỢNG, VẬN HẠN & ĐỊNH HƯỚNG

### 7.1 Hình tượng trong mắt người khác
- Mệnh cung: ấn tượng đầu tiên người ngoài thấy?
- Thiên di: hình tượng xã hội lâu dài, sức hút với người lạ?
- Khoảng cách bên trong ↔ bên ngoài: có hay bị hiểu lầm không?
- Sao nổi bật (Thiên Khôi/Việt, Văn Xương/Khúc, Tham Lang...) ảnh hưởng đến sức hút và tầm ảnh hưởng?

### 7.2 Vận hạn tổng hợp
- Đại hạn hiện tại: cung nào đang cai quản, xu hướng 10 năm tổng thể?
- Lưu niên năm nay: tứ hóa lưu niên tác động vào các cung trọng yếu nào?
- Tổng hợp: giai đoạn này thuận hay nghịch ở lĩnh vực nào nhất?

### 7.3 Ưu tiên hóa giải
Các cung/sao cần chú ý nhất và biện pháp cụ thể.

### 7.4 Định hướng hành động
- Phong thủy bổ trợ: hướng, màu sắc, vật phẩm phù hợp ngũ hành cục.
- Thông điệp hành động tổng thể — cụ thể, không phải lời an ủi chung.`;

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
