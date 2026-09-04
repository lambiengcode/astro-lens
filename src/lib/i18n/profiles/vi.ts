// ============================================================
// CANDIDATE-SCREEN STAR PROFILES — vi
// ============================================================
//
// The 13-candidate screen has no mockup section; PLAN.md §11 D2 settles its
// treatment. This is its editorial copy: what each Mệnh-cung chính tinh, or
// each named two-star pair, reads like. It is prose about the tradition, not
// vocabulary, so it lives here and not in `../vocabulary.ts`.
//
// Keys are the Vietnamese star names the chart data carries, because the chart
// is always generated in `vi-VN` — see `src/lib/iztro.ts`. They are lookup
// keys, never rendered.

import type { Profiles } from './types';

const vi: Profiles = {
  empty: [
    'Người Linh Hoạt',
    ['Hòa đồng', 'Thích nghi', 'Chịu ảnh hưởng'],
    'Dễ thích nghi với nhiều môi trường, không cứng nhắc — có thể hòa hợp với nhiều kiểu người.',
    'Đôi khi thiếu định hướng rõ ràng, dễ bị ảnh hưởng bởi người xung quanh hơn ý chí nội tâm.',
  ],

  single: {
    "Tử Vi": [
      "Người Lãnh Đạo",
      ["Tham vọng", "Uy nghiêm", "Cầu toàn"],
      "Sinh ra để chỉ huy — tự nhiên thu hút sự nể phục, giỏi nhìn ra bức tranh lớn.",
      "Khó chia sẻ quyền lực, đôi khi cô đơn ở đỉnh cao vì không ai đủ tiêu chuẩn.",
    ],
    "Thiên Cơ": [
      "Nhà Chiến Lược",
      ["Thông minh", "Đa mưu", "Hay phân vân"],
      "Tư duy nhanh, giỏi phân tích tình huống và đưa ra giải pháp sáng tạo.",
      "Suy nghĩ quá nhiều trước khi hành động, đôi khi bỏ lỡ thời cơ vì còn tính.",
    ],
    "Thái Dương": [
      "Người Tỏa Sáng",
      ["Nhiệt huyết", "Hào phóng", "Hướng ngoại"],
      "Truyền cảm hứng cho người xung quanh, rộng rãi và luôn mang năng lượng tích cực.",
      "Cần được công nhận — khi thiếu sự chú ý, dễ mất động lực và buồn bã.",
    ],
    "Vũ Khúc": [
      "Người Hành Động",
      ["Quyết đoán", "Thực tế", "Độc lập"],
      "Không nói nhiều, làm thật — giỏi biến kế hoạch thành kết quả cụ thể.",
      "Thiếu kiên nhẫn với người chậm chạp, đôi khi bị xem là lạnh lùng hay cứng nhắc.",
    ],
    "Thiên Đồng": [
      "Người Hòa Giải",
      ["Nhân hậu", "Dễ chịu", "Thích bình yên"],
      "Tự nhiên được nhiều người yêu mến, giỏi xây dựng không khí hài hòa trong nhóm.",
      "Tránh xung đột đến mức không dám nói thẳng, hay để người khác lấn át.",
    ],
    "Liêm Trinh": [
      "Người Nguyên Tắc",
      ["Sắc sảo", "Nguyên tắc", "Phức tạp"],
      "Trung thành tuyệt đối với những gì tin tưởng, sắc bén trong phán đoán người.",
      "Khó đọc, hay bị hiểu lầm là lạnh nhạt — thực ra giàu cảm xúc nhưng giấu kín.",
    ],
    "Thiên Phủ": [
      "Người Xây Dựng",
      ["Ổn định", "Tích lũy", "Đáng tin"],
      "Kiên nhẫn xây dựng từng bước, giỏi bảo tồn và phát triển tài sản lâu dài.",
      "Ít thích rủi ro và cái mới, đôi khi bỏ lỡ cơ hội vì quá thận trọng.",
    ],
    "Thái Âm": [
      "Người Cảm Nhận",
      ["Nhạy cảm", "Trực giác mạnh", "Tinh tế"],
      "Đọc được cảm xúc người khác cực nhanh, trực giác thường đúng hơn logic.",
      "Dễ bị tổn thương khi không được trân trọng, hay gánh cảm xúc của người xung quanh.",
    ],
    "Tham Lang": [
      "Người Khám Phá",
      ["Đa tài", "Hấp dẫn", "Ham trải nghiệm"],
      "Học gì cũng nhanh, sức hút tự nhiên — luôn là tâm điểm chú ý trong mọi đám đông.",
      "Dễ chán và muốn thay đổi liên tục, khó tập trung đủ lâu để đạt đỉnh ở một lĩnh vực.",
    ],
    "Cự Môn": [
      "Nhà Tư Tưởng",
      ["Phân tích", "Thẳng thắn", "Tranh biện"],
      "Nhìn thấu vấn đề nhanh, lời nói có sức nặng — thuyết phục bằng logic và bằng chứng.",
      "Thẳng thắn đến mức hay gây tranh cãi, đôi khi quá hoài nghi và khó tin người.",
    ],
    "Thiên Tướng": [
      "Người Bảo Vệ",
      ["Công bằng", "Trách nhiệm", "Trung thực"],
      "Làm người khác cảm thấy an toàn — nguyên tắc, đáng tin, không bao giờ phản bội.",
      "Đôi khi quá cứng nhắc với quy tắc, khó linh hoạt khi tình huống cần ngoại lệ.",
    ],
    "Thiên Lương": [
      "Người Chữa Lành",
      ["Nhân từ", "Hay giúp đỡ", "Có đức"],
      "Bản năng giúp đỡ và chữa lành — được bề trên tin tưởng, hay làm cố vấn tinh thần.",
      "Hay hy sinh quá mức cho người khác đến mức quên bản thân, dễ bị lợi dụng lòng tốt.",
    ],
    "Thất Sát": [
      "Chiến Binh",
      ["Mạnh mẽ", "Quyết liệt", "Độc lập"],
      "Không sợ thách thức — càng áp lực càng bùng phát, giỏi tự mình vượt qua nghịch cảnh.",
      "Hành động trước suy nghĩ sau, khó chấp nhận sự yếu đuối — của mình lẫn người khác.",
    ],
    "Phá Quân": [
      "Người Đột Phá",
      ["Cá tính", "Táo bạo", "Không lối mòn"],
      "Dám phá vỡ những gì không còn phù hợp — tiên phong, sáng tạo, không bị trói buộc.",
      "Hay phá xong mà chưa biết xây cái mới, khó giữ ổn định lâu dài trong tình cảm và công việc.",
    ],  },

  combo: {
    "Tử Vi+Thiên Phủ": [
      "Đế Vương",
      ["Vừa uy nghiêm vừa vững chắc", "Tham vọng", "Tích lũy"],
      "Kết hợp uy lực lãnh đạo và nền tảng ổn định — hiếm người có thể làm vừa lòng lẫn nể phục.",
      "Hay quá hoàn hảo đến mức khó tiếp cận, người khác thán phục nhưng đôi khi ngại gần.",
    ],
    "Tử Vi+Tham Lang": [
      "Lãnh Đạo Đa Tài",
      ["Hấp dẫn", "Tham vọng", "Năng động"],
      "Kết hợp quyền lực và sức hút cá nhân — vừa thu phục lòng người vừa giỏi tạo ra cơ hội.",
      "Ham quá nhiều thứ cùng lúc, đôi khi phân tán sức lực thay vì tập trung vào một đỉnh cao.",
    ],
    "Tử Vi+Phá Quân": [
      "Người Cải Cách",
      ["Đột phá", "Uy quyền", "Không ngại rủi ro"],
      "Vừa có tầm nhìn lớn vừa dám hành động táo bạo — phù hợp dẫn dắt những thay đổi lớn.",
      "Dễ đi quá nhanh so với người xung quanh, hay bị phản đối khi muốn thay đổi cấu trúc cũ.",
    ],
    "Thái Dương+Thái Âm": [
      "Người Cân Bằng",
      ["Nhiệt huyết", "Nhạy cảm", "Hai mặt"],
      "Vừa hướng ngoại vừa sâu sắc bên trong — hiểu người khác và biết cách truyền cảm hứng.",
      "Tâm trạng thất thường giữa nhiệt huyết và nhạy cảm, cần môi trường ổn định để phát huy.",
    ],
    "Thái Dương+Thiên Lương": [
      "Người Truyền Cảm Hứng",
      ["Nhiệt huyết", "Nhân từ", "Hay giúp người"],
      "Năng lượng tích cực kết hợp lòng nhân đức — tự nhiên trở thành chỗ dựa tinh thần cho nhiều người.",
      "Dễ gánh quá nhiều chuyện của người khác, cần học cách từ chối mà không cảm thấy tội lỗi.",
    ],
    "Vũ Khúc+Thiên Tướng": [
      "Nhà Quản Lý",
      ["Thực tế", "Công bằng", "Có hệ thống"],
      "Kết hợp hiệu quả thực thi và sự công bằng — phù hợp vị trí điều hành và quản lý tổ chức.",
      "Đôi khi quá tập trung vào quy trình và kết quả mà quên đi yếu tố con người.",
    ],
    "Vũ Khúc+Thất Sát": [
      "Người Tiên Phong",
      ["Quyết liệt", "Độc lập", "Hành động"],
      "Không chờ ai — tự mình xông pha, phù hợp khởi nghiệp và những vai trò đòi hỏi dám nghĩ dám làm.",
      "Hay đi một mình quá, khó phối hợp nhóm và dễ phớt lờ cảm xúc người cộng tác.",
    ],
    "Vũ Khúc+Phá Quân": [
      "Nhà Khai Phá",
      ["Táo bạo", "Thực dụng", "Không sợ thất bại"],
      "Dám thử những gì người khác không dám — kết hợp hành động và đột phá, phù hợp mở đường mới.",
      "Dễ bỏ cuộc giữa chừng khi tìm ra hướng mới, thiếu kiên trì hoàn thiện những gì đã bắt đầu.",
    ],
    "Liêm Trinh+Thiên Phủ": [
      "Người Chiến Lược Bền Vững",
      ["Nguyên tắc", "Tích lũy", "Sâu sắc"],
      "Vừa sắc bén trong phán đoán vừa kiên nhẫn xây dựng — giỏi duy trì thứ gì đó giá trị lâu dài.",
      "Khép kín và khó đọc, người mới gặp hay ngại tiếp cận dù bên trong rất đáng tin.",
    ],
    "Liêm Trinh+Thất Sát": [
      "Người Cứng Rắn",
      ["Kiên định", "Không khoan nhượng", "Bản lĩnh"],
      "Không bị lung lay bởi áp lực hay cám dỗ — trung thành với nguyên tắc dù khó khăn.",
      "Đôi khi quá cứng đến mức không chịu thỏa hiệp dù tình huống cần linh hoạt.",
    ],
    "Liêm Trinh+Phá Quân": [
      "Người Nổi Loạn Có Nguyên Tắc",
      ["Cá tính", "Sắc sảo", "Chống lại lối mòn"],
      "Phá vỡ quy chuẩn nhưng không phá vỡ nguyên tắc của bản thân — độc lập và khó đoán.",
      "Hay gây tranh cãi và khó được chấp nhận trong môi trường bảo thủ.",
    ],
    "Liêm Trinh+Tham Lang": [
      "Người Quyến Rũ Phức Tạp",
      ["Hấp dẫn", "Bí ẩn", "Nguyên tắc ẩn"],
      "Kết hợp sức hút đặc biệt và chiều sâu nội tâm — cuốn hút người khác theo cách không ai giải thích được.",
      "Dễ bị cuốn vào những mối quan hệ hay cám dỗ phức tạp, cần kỷ luật bản thân cao.",
    ],
    "Thiên Đồng+Thái Âm": [
      "Người Nuôi Dưỡng",
      ["Nhạy cảm", "Quan tâm", "Bình yên"],
      "Khả năng tạo ra không gian an toàn cho người khác — ai ở bên cũng cảm thấy được lắng nghe.",
      "Quá ưu tiên người khác đến mức quên nhu cầu của chính mình, dễ kiệt sức cảm xúc.",
    ],
    "Thiên Đồng+Cự Môn": [
      "Người Tư Vấn",
      ["Nhân hậu", "Phân tích", "Ăn nói khéo"],
      "Vừa hiểu người vừa giỏi phân tích — phù hợp làm cố vấn, tư vấn, hoặc giải quyết mâu thuẫn.",
      "Hay bị kẹt giữa muốn giữ hòa khí và cần nói thật, đôi khi không dứt khoát được.",
    ],  },
};

export default vi;
