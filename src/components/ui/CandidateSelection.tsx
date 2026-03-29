'use client';

import { useState } from 'react';
import type { RectificationCandidate } from '@/types';

// ── Per-star personality profile ─────────────────────────────────────────────
interface StarProfile {
  archetype: string;   // Short label, e.g. "Người Lãnh Đạo"
  tags: string[];      // 3 quick-scan keywords
  strength: string;    // What they're naturally good at
  challenge: string;   // What trips them up
}

const STAR_PROFILES: Record<string, StarProfile> = {
  'Tử Vi': {
    archetype: 'Người Lãnh Đạo',
    tags: ['Tham vọng', 'Uy nghiêm', 'Cầu toàn'],
    strength: 'Sinh ra để chỉ huy — tự nhiên thu hút sự nể phục, giỏi nhìn ra bức tranh lớn.',
    challenge: 'Khó chia sẻ quyền lực, đôi khi cô đơn ở đỉnh cao vì không ai đủ tiêu chuẩn.',
  },
  'Thiên Cơ': {
    archetype: 'Nhà Chiến Lược',
    tags: ['Thông minh', 'Đa mưu', 'Hay phân vân'],
    strength: 'Tư duy nhanh, giỏi phân tích tình huống và đưa ra giải pháp sáng tạo.',
    challenge: 'Suy nghĩ quá nhiều trước khi hành động, đôi khi bỏ lỡ thời cơ vì còn tính.',
  },
  'Thái Dương': {
    archetype: 'Người Tỏa Sáng',
    tags: ['Nhiệt huyết', 'Hào phóng', 'Hướng ngoại'],
    strength: 'Truyền cảm hứng cho người xung quanh, rộng rãi và luôn mang năng lượng tích cực.',
    challenge: 'Cần được công nhận — khi thiếu sự chú ý, dễ mất động lực và buồn bã.',
  },
  'Vũ Khúc': {
    archetype: 'Người Hành Động',
    tags: ['Quyết đoán', 'Thực tế', 'Độc lập'],
    strength: 'Không nói nhiều, làm thật — giỏi biến kế hoạch thành kết quả cụ thể.',
    challenge: 'Thiếu kiên nhẫn với người chậm chạp, đôi khi bị xem là lạnh lùng hay cứng nhắc.',
  },
  'Thiên Đồng': {
    archetype: 'Người Hòa Giải',
    tags: ['Nhân hậu', 'Dễ chịu', 'Thích bình yên'],
    strength: 'Tự nhiên được nhiều người yêu mến, giỏi xây dựng không khí hài hòa trong nhóm.',
    challenge: 'Tránh xung đột đến mức không dám nói thẳng, hay để người khác lấn át.',
  },
  'Liêm Trinh': {
    archetype: 'Người Nguyên Tắc',
    tags: ['Sắc sảo', 'Nguyên tắc', 'Phức tạp'],
    strength: 'Trung thành tuyệt đối với những gì tin tưởng, sắc bén trong phán đoán người.',
    challenge: 'Khó đọc, hay bị hiểu lầm là lạnh nhạt — thực ra giàu cảm xúc nhưng giấu kín.',
  },
  'Thiên Phủ': {
    archetype: 'Người Xây Dựng',
    tags: ['Ổn định', 'Tích lũy', 'Đáng tin'],
    strength: 'Kiên nhẫn xây dựng từng bước, giỏi bảo tồn và phát triển tài sản lâu dài.',
    challenge: 'Ít thích rủi ro và cái mới, đôi khi bỏ lỡ cơ hội vì quá thận trọng.',
  },
  'Thái Âm': {
    archetype: 'Người Cảm Nhận',
    tags: ['Nhạy cảm', 'Trực giác mạnh', 'Tinh tế'],
    strength: 'Đọc được cảm xúc người khác cực nhanh, trực giác thường đúng hơn logic.',
    challenge: 'Dễ bị tổn thương khi không được trân trọng, hay gánh cảm xúc của người xung quanh.',
  },
  'Tham Lang': {
    archetype: 'Người Khám Phá',
    tags: ['Đa tài', 'Hấp dẫn', 'Ham trải nghiệm'],
    strength: 'Học gì cũng nhanh, sức hút tự nhiên — luôn là tâm điểm chú ý trong mọi đám đông.',
    challenge: 'Dễ chán và muốn thay đổi liên tục, khó tập trung đủ lâu để đạt đỉnh ở một lĩnh vực.',
  },
  'Cự Môn': {
    archetype: 'Nhà Tư Tưởng',
    tags: ['Phân tích', 'Thẳng thắn', 'Tranh biện'],
    strength: 'Nhìn thấu vấn đề nhanh, lời nói có sức nặng — thuyết phục bằng logic và bằng chứng.',
    challenge: 'Thẳng thắn đến mức hay gây tranh cãi, đôi khi quá hoài nghi và khó tin người.',
  },
  'Thiên Tướng': {
    archetype: 'Người Bảo Vệ',
    tags: ['Công bằng', 'Trách nhiệm', 'Trung thực'],
    strength: 'Làm người khác cảm thấy an toàn — nguyên tắc, đáng tin, không bao giờ phản bội.',
    challenge: 'Đôi khi quá cứng nhắc với quy tắc, khó linh hoạt khi tình huống cần ngoại lệ.',
  },
  'Thiên Lương': {
    archetype: 'Người Chữa Lành',
    tags: ['Nhân từ', 'Hay giúp đỡ', 'Có đức'],
    strength: 'Bản năng giúp đỡ và chữa lành — được bề trên tin tưởng, hay làm cố vấn tinh thần.',
    challenge: 'Hay hy sinh quá mức cho người khác đến mức quên bản thân, dễ bị lợi dụng lòng tốt.',
  },
  'Thất Sát': {
    archetype: 'Chiến Binh',
    tags: ['Mạnh mẽ', 'Quyết liệt', 'Độc lập'],
    strength: 'Không sợ thách thức — càng áp lực càng bùng phát, giỏi tự mình vượt qua nghịch cảnh.',
    challenge: 'Hành động trước suy nghĩ sau, khó chấp nhận sự yếu đuối — của mình lẫn người khác.',
  },
  'Phá Quân': {
    archetype: 'Người Đột Phá',
    tags: ['Cá tính', 'Táo bạo', 'Không lối mòn'],
    strength: 'Dám phá vỡ những gì không còn phù hợp — tiên phong, sáng tạo, không bị trói buộc.',
    challenge: 'Hay phá xong mà chưa biết xây cái mới, khó giữ ổn định lâu dài trong tình cảm và công việc.',
  },
};

const EMPTY_PALACE_PROFILE: StarProfile = {
  archetype: 'Người Linh Hoạt',
  tags: ['Hòa đồng', 'Thích nghi', 'Chịu ảnh hưởng'],
  strength: 'Dễ thích nghi với nhiều môi trường, không cứng nhắc — có thể hòa hợp với nhiều kiểu người.',
  challenge: 'Đôi khi thiếu định hướng rõ ràng, dễ bị ảnh hưởng bởi người xung quanh hơn ý chí nội tâm.',
};

// For two-star combos, give a specific combined profile
const COMBO_PROFILES: Record<string, StarProfile> = {
  'Tử Vi+Thiên Phủ': {
    archetype: 'Đế Vương',
    tags: ['Vừa uy nghiêm vừa vững chắc', 'Tham vọng', 'Tích lũy'],
    strength: 'Kết hợp uy lực lãnh đạo và nền tảng ổn định — hiếm người có thể làm vừa lòng lẫn nể phục.',
    challenge: 'Hay quá hoàn hảo đến mức khó tiếp cận, người khác thán phục nhưng đôi khi ngại gần.',
  },
  'Tử Vi+Tham Lang': {
    archetype: 'Lãnh Đạo Đa Tài',
    tags: ['Hấp dẫn', 'Tham vọng', 'Năng động'],
    strength: 'Kết hợp quyền lực và sức hút cá nhân — vừa thu phục lòng người vừa giỏi tạo ra cơ hội.',
    challenge: 'Ham quá nhiều thứ cùng lúc, đôi khi phân tán sức lực thay vì tập trung vào một đỉnh cao.',
  },
  'Tử Vi+Phá Quân': {
    archetype: 'Người Cải Cách',
    tags: ['Đột phá', 'Uy quyền', 'Không ngại rủi ro'],
    strength: 'Vừa có tầm nhìn lớn vừa dám hành động táo bạo — phù hợp dẫn dắt những thay đổi lớn.',
    challenge: 'Dễ đi quá nhanh so với người xung quanh, hay bị phản đối khi muốn thay đổi cấu trúc cũ.',
  },
  'Thái Dương+Thái Âm': {
    archetype: 'Người Cân Bằng',
    tags: ['Nhiệt huyết', 'Nhạy cảm', 'Hai mặt'],
    strength: 'Vừa hướng ngoại vừa sâu sắc bên trong — hiểu người khác và biết cách truyền cảm hứng.',
    challenge: 'Tâm trạng thất thường giữa nhiệt huyết và nhạy cảm, cần môi trường ổn định để phát huy.',
  },
  'Thái Dương+Thiên Lương': {
    archetype: 'Người Truyền Cảm Hứng',
    tags: ['Nhiệt huyết', 'Nhân từ', 'Hay giúp người'],
    strength: 'Năng lượng tích cực kết hợp lòng nhân đức — tự nhiên trở thành chỗ dựa tinh thần cho nhiều người.',
    challenge: 'Dễ gánh quá nhiều chuyện của người khác, cần học cách từ chối mà không cảm thấy tội lỗi.',
  },
  'Vũ Khúc+Thiên Tướng': {
    archetype: 'Nhà Quản Lý',
    tags: ['Thực tế', 'Công bằng', 'Có hệ thống'],
    strength: 'Kết hợp hiệu quả thực thi và sự công bằng — phù hợp vị trí điều hành và quản lý tổ chức.',
    challenge: 'Đôi khi quá tập trung vào quy trình và kết quả mà quên đi yếu tố con người.',
  },
  'Vũ Khúc+Thất Sát': {
    archetype: 'Người Tiên Phong',
    tags: ['Quyết liệt', 'Độc lập', 'Hành động'],
    strength: 'Không chờ ai — tự mình xông pha, phù hợp khởi nghiệp và những vai trò đòi hỏi dám nghĩ dám làm.',
    challenge: 'Hay đi một mình quá, khó phối hợp nhóm và dễ phớt lờ cảm xúc người cộng tác.',
  },
  'Vũ Khúc+Phá Quân': {
    archetype: 'Nhà Khai Phá',
    tags: ['Táo bạo', 'Thực dụng', 'Không sợ thất bại'],
    strength: 'Dám thử những gì người khác không dám — kết hợp hành động và đột phá, phù hợp mở đường mới.',
    challenge: 'Dễ bỏ cuộc giữa chừng khi tìm ra hướng mới, thiếu kiên trì hoàn thiện những gì đã bắt đầu.',
  },
  'Liêm Trinh+Thiên Phủ': {
    archetype: 'Người Chiến Lược Bền Vững',
    tags: ['Nguyên tắc', 'Tích lũy', 'Sâu sắc'],
    strength: 'Vừa sắc bén trong phán đoán vừa kiên nhẫn xây dựng — giỏi duy trì thứ gì đó giá trị lâu dài.',
    challenge: 'Khép kín và khó đọc, người mới gặp hay ngại tiếp cận dù bên trong rất đáng tin.',
  },
  'Liêm Trinh+Thất Sát': {
    archetype: 'Người Cứng Rắn',
    tags: ['Kiên định', 'Không khoan nhượng', 'Bản lĩnh'],
    strength: 'Không bị lung lay bởi áp lực hay cám dỗ — trung thành với nguyên tắc dù khó khăn.',
    challenge: 'Đôi khi quá cứng đến mức không chịu thỏa hiệp dù tình huống cần linh hoạt.',
  },
  'Liêm Trinh+Phá Quân': {
    archetype: 'Người Nổi Loạn Có Nguyên Tắc',
    tags: ['Cá tính', 'Sắc sảo', 'Chống lại lối mòn'],
    strength: 'Phá vỡ quy chuẩn nhưng không phá vỡ nguyên tắc của bản thân — độc lập và khó đoán.',
    challenge: 'Hay gây tranh cãi và khó được chấp nhận trong môi trường bảo thủ.',
  },
  'Liêm Trinh+Tham Lang': {
    archetype: 'Người Quyến Rũ Phức Tạp',
    tags: ['Hấp dẫn', 'Bí ẩn', 'Nguyên tắc ẩn'],
    strength: 'Kết hợp sức hút đặc biệt và chiều sâu nội tâm — cuốn hút người khác theo cách không ai giải thích được.',
    challenge: 'Dễ bị cuốn vào những mối quan hệ hay cám dỗ phức tạp, cần kỷ luật bản thân cao.',
  },
  'Thiên Đồng+Thái Âm': {
    archetype: 'Người Nuôi Dưỡng',
    tags: ['Nhạy cảm', 'Quan tâm', 'Bình yên'],
    strength: 'Khả năng tạo ra không gian an toàn cho người khác — ai ở bên cũng cảm thấy được lắng nghe.',
    challenge: 'Quá ưu tiên người khác đến mức quên nhu cầu của chính mình, dễ kiệt sức cảm xúc.',
  },
  'Thiên Đồng+Cự Môn': {
    archetype: 'Người Tư Vấn',
    tags: ['Nhân hậu', 'Phân tích', 'Ăn nói khéo'],
    strength: 'Vừa hiểu người vừa giỏi phân tích — phù hợp làm cố vấn, tư vấn, hoặc giải quyết mâu thuẫn.',
    challenge: 'Hay bị kẹt giữa muốn giữ hòa khí và cần nói thật, đôi khi không dứt khoát được.',
  },
};

function getProfile(candidate: RectificationCandidate): StarProfile {
  const stars = candidate.menhMajorStars;
  if (stars.length === 0) return EMPTY_PALACE_PROFILE;

  // Check two-star combo first
  if (stars.length >= 2) {
    const comboKey = `${stars[0]}+${stars[1]}`;
    const reverseKey = `${stars[1]}+${stars[0]}`;
    if (COMBO_PROFILES[comboKey]) return COMBO_PROFILES[comboKey];
    if (COMBO_PROFILES[reverseKey]) return COMBO_PROFILES[reverseKey];
  }

  // Fall back to single star
  return STAR_PROFILES[stars[0]] ?? EMPTY_PALACE_PROFILE;
}

function getStarColor(star: string): string {
  const purpleStars = ['Tử Vi', 'Thiên Phủ', 'Thiên Tướng', 'Thiên Lương', 'Thiên Cơ', 'Thiên Đồng'];
  const goldStars   = ['Thái Dương', 'Thái Âm', 'Vũ Khúc'];
  if (purpleStars.includes(star)) return 'text-[#9775cd]';
  if (goldStars.includes(star))   return 'text-[#e8b339]';
  return 'text-[#5b8af5]';
}

interface Props {
  candidates: RectificationCandidate[];
  solarDate: string;
  gender: 'male' | 'female';
  name?: string;
  onSelect: (timeIndex: number) => void;
  onBack: () => void;
}

export default function CandidateSelection({ candidates, solarDate, gender, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3b5bdb]/10 border border-[#3b5bdb]/20 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5b8af5] animate-pulse" />
          <span className="text-xs text-[#5b8af5]">Chọn Cung Mệnh</span>
        </div>
        <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">
          13 lá số ứng với 13 giờ sinh
        </h3>
        <p className="text-xs text-[#6b7a94] max-w-sm mx-auto leading-relaxed">
          Đọc mô tả và chọn cái phản ánh đúng <span className="text-[#e2e8f0]">tính cách</span> bạn nhất.
          <br />Sinh ngày <span className="text-[#e2e8f0]">{solarDate}</span> · <span className="text-[#e2e8f0]">{gender === 'male' ? 'Nam' : 'Nữ'}</span>
        </p>
      </div>

      {/* Candidate list */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
        {candidates.map((c) => {
          const isSelected = selected === c.timeIndex;
          const profile = getProfile(c);

          return (
            <button
              key={c.timeIndex}
              type="button"
              onClick={() => setSelected(c.timeIndex)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-[#3b5bdb] bg-[#121d3a] ring-1 ring-[#3b5bdb]/30'
                  : 'border-[#1e2538] bg-[#0d1117] hover:border-[#2a3a5c] hover:bg-[#0f1520]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio */}
                <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'border-[#3b5bdb] bg-[#3b5bdb]' : 'border-[#2a3550]'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Row 1: hour + archetype + mệnh location */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      isSelected ? 'text-[#5b8af5] border-[#3b5bdb]/40 bg-[#3b5bdb]/10' : 'text-[#4a5568] border-[#1e2538]'
                    }`}>
                      {c.hourRange}
                    </span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-[#e2e8f0]' : 'text-[#c9d1d9]'}`}>
                      {profile.archetype}
                    </span>
                    <span className="text-[10px] text-[#3d4a5c]">
                      Mệnh·{c.menhEarthlyBranch} · {c.fiveElementsClass}
                    </span>
                  </div>

                  {/* Row 2: major stars */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {c.menhMajorStars.length > 0 ? (
                      c.menhMajorStars.map((star) => (
                        <span key={star} className={`text-xs font-bold ${getStarColor(star)}`}>
                          {star}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#3d4a5c] italic">Cung trống — nhận triều chiếu đối cung</span>
                    )}
                    {/* Tags */}
                    {profile.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a2236] text-[#4a5568]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Row 3: strength + challenge */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#5b7a9d] leading-relaxed">
                      <span className="text-[#22c55e] mr-1">✓</span>{profile.strength}
                    </p>
                    <p className="text-[11px] text-[#4a5568] leading-relaxed">
                      <span className="text-[#f59e0b] mr-1">△</span>{profile.challenge}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-[#1e2538] text-[#6b7a94] text-sm font-medium hover:border-[#3d4a5c] hover:text-[#e2e8f0] transition-all"
        >
          ← Quay lại
        </button>
        <button
          type="button"
          disabled={selected === null}
          onClick={() => selected !== null && onSelect(selected)}
          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#2b4bc6] to-[#3b5bdb] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
        >
          ✦ Lập lá số với giờ này
        </button>
      </div>

      <p className="text-[10px] text-[#3d4a5c] text-center">
        Chưa chắc? Hãy chọn cái gần nhất — bạn luôn có thể quay lại thử giờ khác.
      </p>
    </div>
  );
}
