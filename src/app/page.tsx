import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import BirthForm from '@/components/ui/BirthForm';

// ── Mini palace grid preview ──────────────────────────────────────────────────
function MiniPalaceGrid() {
  const cells = [
    { label: 'Tỵ', star: 'Thiên Cơ', color: 'text-[#9775cd]' },
    { label: 'Ngọ', star: 'Tử Vi', color: 'text-[#e8b339]', highlight: true },
    { label: 'Mùi', star: 'Thái Dương', color: 'text-[#9775cd]' },
    { label: 'Thân', star: '', color: '' },
    { label: 'Thìn', star: 'Vũ Khúc', color: 'text-[#5b8af5]' },
    { label: '', star: '', color: '', center: true },
    { label: '', star: '', color: '', center: true },
    { label: 'Dậu', star: 'Thiên Đồng', color: 'text-[#9775cd]' },
    { label: 'Mão', star: 'Liêm Trinh', color: 'text-[#5b8af5]' },
    { label: '', star: '', color: '', center: true },
    { label: '', star: '', color: '', center: true },
    { label: 'Tuất', star: '', color: '' },
    { label: 'Dần', star: '', color: '' },
    { label: 'Sửu', star: 'Thiên Phủ', color: 'text-[#e8b339]' },
    { label: 'Tý', star: 'Phá Quân', color: 'text-[#9775cd]' },
    { label: 'Hợi', star: 'Tham Lang', color: 'text-[#5b8af5]' },
  ];

  return (
    <div className="grid grid-cols-4 gap-[3px] w-full">
      {cells.map((c, i) => {
        if (c.center) {
          return (
            <div key={i} className="glass-1 rounded aspect-square flex items-center justify-center">
              {i === 5 && (
                <div className="text-center">
                  <div className="text-[10px] text-[#3d4a5c] leading-tight">Mệnh</div>
                  <div className="text-[10px] text-[#3d4a5c]">cung</div>
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            key={i}
            className={`rounded aspect-square p-1.5 flex flex-col justify-between ${
              c.highlight
                ? 'glass-strong glass-gold-edge'
                : 'glass-1'
            }`}
          >
            <span className="text-[8px] text-[#4a5568]">{c.label}</span>
            {c.star && (
              <span className={`text-[7px] leading-tight font-medium ${c.color}`}>{c.star}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Mini chat preview ────────────────────────────────────────────────────────
function MiniChat() {
  return (
    <div className="space-y-2.5 text-xs">
      <div className="flex justify-end">
        <div className="chat-bubble-user rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] text-[#c9d1d9]">
          Tình duyên năm nay thế nào?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="chat-bubble-ai rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%] text-[#c9d1d9] leading-relaxed">
          Cung Phu thê có <span className="text-[#9775cd] font-medium">Tham Lang</span> miếu địa — năm nay đại hạn kích hoạt, tình cảm có nhiều cơ hội mới...
        </div>
      </div>
      <div className="flex justify-end">
        <div className="chat-bubble-user rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] text-[#c9d1d9]">
          Nên làm nghề gì?
        </div>
      </div>
      <div className="flex items-center gap-1.5 pl-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#3b5bdb] animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#3b5bdb] animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#3b5bdb] animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

// ── Decadal timeline preview ─────────────────────────────────────────────────
function MiniTimeline() {
  const periods = [
    { age: '3–12', label: 'Mệnh', past: true },
    { age: '13–22', label: 'Phụ Mẫu', past: true },
    { age: '23–32', label: 'Phúc Đức', past: true },
    { age: '33–42', label: 'Điền Trạch', current: true },
    { age: '43–52', label: 'Quan Lộc', future: true },
    { age: '53–62', label: 'Nô Bộc', future: true },
  ];
  return (
    <div className="space-y-1.5">
      {periods.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[9px] text-[#3d4a5c] w-12 shrink-0">{p.age}</span>
          <div className="flex-1 h-5 rounded-full relative overflow-hidden glass-1">
            <div
              className={`h-full rounded-md transition-all ${
                p.current
                  ? 'bg-gradient-to-r from-[#3b5bdb] to-[#5b8af5] w-full'
                  : p.past
                  ? 'bg-[#1e2538] w-full'
                  : 'w-0'
              }`}
            />
            <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium text-[#6b7a94]">
              {p.label}
            </span>
          </div>
          {p.current && (
            <span className="text-[8px] text-[#5b8af5] font-semibold shrink-0">← nay</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Five elements visual ─────────────────────────────────────────────────────
function FiveElements() {
  const elements = [
    { name: 'Kim', vi: 'Kim', color: '#e8b339', pct: 20 },
    { name: 'Mộc', vi: 'Mộc', color: '#22c55e', pct: 35 },
    { name: 'Thủy', vi: 'Thủy', color: '#5b8af5', pct: 15 },
    { name: 'Hỏa', vi: 'Hỏa', color: '#ef4444', pct: 20 },
    { name: 'Thổ', vi: 'Thổ', color: '#9775cd', pct: 10 },
  ];
  return (
    <div className="space-y-2">
      {elements.map((el) => (
        <div key={el.name} className="flex items-center gap-2">
          <span className="text-[10px] text-[#6b7a94] w-6 shrink-0">{el.vi}</span>
          <div className="flex-1 h-1.5 bg-[#1e2538] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${el.pct}%`, backgroundColor: el.color }}
            />
          </div>
          <span className="text-[10px] text-[#4a5568] w-6 text-right">{el.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-28 overflow-hidden">
          <div className="absolute inset-0 stars-bg opacity-40" />
          <div className="absolute top-16 left-[15%] w-[500px] h-[500px] bg-[#3b5bdb]/[0.04] rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-[#9775cd]/[0.04] rounded-full blur-[80px] animate-pulse-gold" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
            <div className="absolute inset-0 rounded-full border border-[#1e2538]/30" />
            <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#3b5bdb]/60" style={{ animation: 'orbit 25s linear infinite' }} />
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-[#e8b339]/40" style={{ animation: 'orbit 35s linear infinite reverse' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 chip-glass mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3b5bdb] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5b8af5]" />
              </span>
              <span className="text-sm text-[#6b7a94]">Tử Vi Đẩu Số &mdash; AI Luận Giải</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in-up stagger-1">
              <span className="text-[#e2e8f0]">Khám Phá Vận Mệnh</span>
              <br />
              <span className="bg-gradient-to-r from-[#3b5bdb] via-[#9775cd] to-[#e8b339] bg-clip-text text-transparent">
                Bằng Trí Tuệ Nhân Tạo
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#6b7a94] max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2">
              Hệ thống luận giải Tử Vi Đẩu Số chuyên sâu, kết hợp thuật toán cổ truyền
              với Gemini AI. Phân tích 12 cung, ngũ hành, đại vận — trung thực, rõ ràng, không mơ hồ.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <a
                href="#lap-la-so"
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full press-spring bg-gradient-to-r from-[#2b4bc6] to-[#3b5bdb] text-white font-semibold text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_30px_rgba(59,91,219,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_40px_rgba(59,91,219,0.35)]"
              >
                <span className="text-xl group-hover:animate-float">✦</span>
                Lập Lá Số Ngay
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3b5bdb] to-[#5b8af5] opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
              </a>
              <div className="flex items-center gap-2 text-[#4a5568] text-sm">
                <span className="text-[#22c55e]">✓</span> Miễn phí &nbsp;·&nbsp;
                <span className="text-[#22c55e]">✓</span> Không cần đăng ký
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <section className="glass-1 border-l-0 border-r-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '12', label: 'Cung phân tích' },
              { value: '108+', label: 'Sao được tính' },
              { value: 'AI', label: 'Gemini 2.5 Pro' },
              { value: '100%', label: 'Dựa trên dữ liệu' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#5b8af5] to-[#9775cd] bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs text-[#4a5568] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento grid ───────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3b5bdb]/[0.02] to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">

            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] mb-3">
                Đầy đủ mọi góc nhìn về lá số
              </h2>
              <p className="text-[#6b7a94] max-w-xl mx-auto">
                Từ cung vị cổ truyền đến luận giải AI hiện đại — tất cả trong một nơi.
              </p>
            </div>

            {/* Row 1: 2-col + 1-col */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

              {/* Card: 12-palace chart — spans 2 cols */}
              <div className="sm:col-span-2 group p-6 rounded-2xl glass press-spring">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                      <span className="text-[10px] text-[#5b8af5] font-medium">LÁ SỐ</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#e2e8f0]">Bản Đồ 12 Cung</h3>
                    <p className="text-xs text-[#4a5568] mt-1 max-w-xs">
                      Hiển thị đầy đủ chính tinh, phụ tinh, tạp diệu theo bố cục 4×4 chuẩn Tử Vi Đẩu Số.
                    </p>
                  </div>
                  <span className="text-2xl opacity-40">◇</span>
                </div>
                <div className="mt-2">
                  <MiniPalaceGrid />
                </div>
              </div>

              {/* Card: AI score */}
              <div className="p-6 rounded-2xl glass press-spring flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                    <span className="text-[10px] text-[#e8b339] font-medium">PHÂN TÍCH</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#e2e8f0]">AI Luận Giải Sâu</h3>
                  <p className="text-xs text-[#4a5568] mt-1 leading-relaxed">
                    Gemini 2.5 Pro phân tích tam phương tứ chính, tương tác sao và hóa giải — không mơ hồ, không chung chung.
                  </p>
                </div>
                <div className="mt-6 space-y-2">
                  {['Tính cách & bản chất', 'Tình duyên & hôn nhân', 'Sự nghiệp & tài chính', 'Vận hạn hiện tại'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="text-[#22c55e] text-xs">✓</span>
                      <span className="text-xs text-[#6b7a94]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: 1-col + 1-col + 1-col */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

              {/* Card: Đại Vận timeline */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                  <span className="text-[10px] text-[#5b8af5] font-medium">ĐẠI VẬN</span>
                </div>
                <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">Vòng Đời 12 Đại Hạn</h3>
                <p className="text-xs text-[#4a5568] mb-4">Xem từng giai đoạn 10 năm — sao, tứ hóa và dự báo xu hướng.</p>
                <MiniTimeline />
              </div>

              {/* Card: Tình duyên */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                  <span className="text-[10px] text-[#9775cd] font-medium">TÌNH DUYÊN</span>
                </div>
                <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">Hôn Nhân & Tình Cảm</h3>
                <p className="text-xs text-[#4a5568] mb-4 leading-relaxed">Phân tích chuyên sâu cung Phu Thê, kiểu bạn đời, thời điểm và số lần duyên tình.</p>
                <div className="space-y-2">
                  {[
                    { label: 'Kiểu bạn đời', icon: '◈' },
                    { label: 'Thời điểm hôn nhân', icon: '◈' },
                    { label: 'Xu hướng số mối', icon: '◈' },
                    { label: 'Hóa giải trắc trở', icon: '◈' },
                  ].map((it) => (
                    <div key={it.label} className="flex items-center gap-2 text-xs text-[#6b7a94]">
                      <span className="text-[#9775cd] text-[10px]">{it.icon}</span>
                      {it.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Hình tượng */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                  <span className="text-[10px] text-[#e8b339] font-medium">HÌNH TƯỢNG</span>
                </div>
                <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">Người Khác Nhìn Bạn Thế Nào</h3>
                <p className="text-xs text-[#4a5568] mb-4 leading-relaxed">Từ ấn tượng đầu tiên đến hình tượng lâu dài — dựa vào Mệnh cung và Thiên Di.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Ấn tượng đầu', color: 'text-[#5b8af5]' },
                    { label: 'Sức hút XH', color: 'text-[#9775cd]' },
                    { label: 'Điểm bị hiểu lầm', color: 'text-[#e8b339]' },
                    { label: 'Quý nhân phù trợ', color: 'text-[#22c55e]' },
                  ].map((it) => (
                    <div key={it.label} className={`chip-glass text-[10px] px-2 py-1.5 text-center ${it.color}`}>
                      {it.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: 1-col + 2-col */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

              {/* Card: Ngũ hành */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                  <span className="text-[10px] text-[#22c55e] font-medium">NGŨ HÀNH</span>
                </div>
                <h3 className="text-base font-semibold text-[#e2e8f0] mb-1">Cân Bằng Ngũ Hành</h3>
                <p className="text-xs text-[#4a5568] mb-4">Hành nào vượng, hành nào thiếu — và tác động lên vận mệnh.</p>
                <FiveElements />
              </div>

              {/* Card: Chat AI — spans 2 cols */}
              <div className="sm:col-span-2 p-6 rounded-2xl glass press-spring">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 chip-glass mb-3">
                      <span className="text-[10px] text-[#5b8af5] font-medium">CHAT AI</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#e2e8f0]">Hỏi Chuyên Gia Tử Vi</h3>
                    <p className="text-xs text-[#4a5568] mt-1">
                      Đặt bất kỳ câu hỏi nào về lá số — AI trả lời dựa trực tiếp vào sao và cung của bạn.
                    </p>
                  </div>
                  <span className="text-xl opacity-30">✦</span>
                </div>
            <div className="glass-1 rounded-2xl p-4">
                  <MiniChat />
                </div>
              </div>
            </div>

            {/* Row 4: 3 small cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Card: Vận hạn */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="w-10 h-10 rounded-xl bg-[#5b8af5]/10 border border-[#5b8af5]/20 flex items-center justify-center mb-4">
                  <span className="text-base">☯</span>
                </div>
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1.5">Vận Hạn Hiện Tại</h3>
                <p className="text-xs text-[#4a5568] leading-relaxed">
                  Lưu niên, lưu nguyệt và tứ hóa chồng chéo — phân tích tác động đến từng lĩnh vực trong năm nay.
                </p>
              </div>

              {/* Card: Privacy */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="w-10 h-10 rounded-xl bg-[#9775cd]/10 border border-[#9775cd]/20 flex items-center justify-center mb-4">
                  <span className="text-base">⊙</span>
                </div>
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1.5">Bảo Mật Dữ Liệu</h3>
                <p className="text-xs text-[#4a5568] leading-relaxed">
                  Thông tin sinh chỉ dùng để tính lá số trong phiên làm việc. Không lưu trữ, không theo dõi.
                </p>
              </div>

              {/* Card: Traditional method */}
              <div className="p-6 rounded-2xl glass press-spring">
                <div className="w-10 h-10 rounded-xl bg-[#e8b339]/10 border border-[#e8b339]/20 flex items-center justify-center mb-4">
                  <span className="text-base">卍</span>
                </div>
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1.5">Phương Pháp Chuẩn</h3>
                <p className="text-xs text-[#4a5568] leading-relaxed">
                  Dùng thư viện iztro — bộ tính lá số Tử Vi chuẩn hóa theo trường phái Đài Loan và Việt Nam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 relative border-t border-[#1e2538]/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-[#e2e8f0] mb-2">Chỉ ba bước đơn giản</h2>
              <p className="text-sm text-[#4a5568]">Từ ngày sinh đến luận giải đầy đủ trong dưới 30 giây</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop) */}
              <div className="hidden sm:block absolute top-8 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px bg-gradient-to-r from-[#1e2538] via-[#3b5bdb]/30 to-[#1e2538]" />
              {[
                { step: '01', icon: '◎', title: 'Nhập thông tin', desc: 'Ngày sinh dương lịch, giờ sinh và giới tính. Hỗ trợ Giờ Tý sớm và muộn.', color: '#5b8af5' },
                { step: '02', icon: '◈', title: 'Tính lá số', desc: 'Thuật toán iztro lập đầy đủ 12 cung, 108 sao và đại hạn trong vài giây.', color: '#9775cd' },
                { step: '03', icon: '✦', title: 'Nhận luận giải', desc: 'Gemini AI viết bài phân tích chi tiết — và trả lời câu hỏi tiếp theo của bạn.', color: '#e8b339' },
              ].map((s) => (
                <div key={s.step} className="text-center relative">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center glass-1"
                    style={{ backgroundColor: `${s.color}12`, borderColor: `${s.color}30` }}
                  >
                    <span className="text-2xl" style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#3d4a5c] mb-1">{s.step}</div>
                  <h3 className="text-sm font-semibold text-[#e2e8f0] mb-1.5">{s.title}</h3>
                  <p className="text-xs text-[#4a5568] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form section ─────────────────────────────────────────────────── */}
        <section id="lap-la-so" className="py-20 sm:py-28 scroll-mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9775cd]/[0.015] to-transparent" />
          <div className="max-w-lg mx-auto px-4 sm:px-6 relative">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#e2e8f0] mb-3">Lập Lá Số Tử Vi</h2>
              <p className="text-[#6b7a94]">Nhập thông tin ngày giờ sinh để bắt đầu</p>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl glass-strong glass-gold-edge animate-pulse-glow">
              <BirthForm />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
