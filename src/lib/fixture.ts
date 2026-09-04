import type { AnalysisResult, BirthInput, PalaceData, StarData } from '@/types';

// ============================================================
// DETERMINISTIC PARITY FIXTURE — PLAN.md §10.1
// ============================================================
// The textbook "Tử Vi tại Tỵ" chart with genuine Giáp-year tứ hóa, matching
// the reference mockup exactly, so a pixel comparison has identical data on
// both sides.
//
// Reached only through `?fixture=tuvi-ty` on /result and only when
// NODE_ENV !== 'production'. See `loadFixture` at the bottom of this file —
// it is the single guard, and it cannot be reached in the deployed app.
//
// FIXTURE_REFERENCE_YEAR pins the "current" đại vận marker so decadal
// snapshots do not rot at the year boundary.

export const FIXTURE_ID = 'tuvi-ty';
export const FIXTURE_REFERENCE_YEAR = 2026;
/** Pins the document date on the paper surface so §05 captures are stable. */
export const FIXTURE_REFERENCE_DATE = '2026-09-03';

const BIRTH_YEAR = 1994;

interface Row {
  branch: string;
  name: string;
  stem: string;
  majors: [string, string, string?][];
  minors: string[];
  adjs: string[];
  cs: string;
  bs: string;
  dr: string;
  than?: boolean;
}

// index follows iztro's ordering: palace 0 is Dần (branch 2)
const BRANCH_ORDER = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const palaceIndexOf = (branch: string) => (BRANCH_ORDER.indexOf(branch) - 2 + 12) % 12;

const ROWS: Row[] = [
  { branch: 'Tý', name: 'Điền Trạch', stem: 'Bính', majors: [['Thiên Đồng', 'vượng'], ['Thái Âm', 'miếu']],
    minors: ['Thiên Việt', 'Địa Không'], adjs: ['Thiên Khốc', 'Bát Tọa'], cs: 'Mộc Dục', bs: 'Lực Sĩ', dr: '94-103' },
  { branch: 'Sửu', name: 'Quan Lộc', stem: 'Đinh', majors: [['Vũ Khúc', 'miếu', 'Khoa'], ['Tham Lang', 'miếu']],
    minors: ['Hữu Bật', 'Linh Tinh'], adjs: ['Đào Hoa', 'Tam Thai'], cs: 'Quan Đới', bs: 'Thanh Long', dr: '84-93' },
  { branch: 'Dần', name: 'Nô Bộc', stem: 'Bính', majors: [['Thái Dương', 'vượng', 'Kỵ'], ['Cự Môn', 'miếu']],
    minors: ['Đà La', 'Thiên Mã'], adjs: ['Thiên Hư', 'Phượng Các'], cs: 'Lâm Quan', bs: 'Tiểu Hao', dr: '74-83' },
  { branch: 'Mão', name: 'Thiên Di', stem: 'Đinh', majors: [['Thiên Tướng', 'hãm']],
    minors: ['Văn Khúc', 'Hỏa Tinh'], adjs: ['Long Trì'], cs: 'Đế Vượng', bs: 'Tướng Quân', dr: '64-73' },
  { branch: 'Thìn', name: 'Tật Ách', stem: 'Mậu', majors: [['Thiên Cơ', 'lợi'], ['Thiên Lương', 'miếu']],
    minors: ['Địa Kiếp'], adjs: ['Thiên Diêu'], cs: 'Suy', bs: 'Tấu Thư', dr: '54-63' },
  { branch: 'Tỵ', name: 'Tài Bạch', stem: 'Kỷ', majors: [['Tử Vi', 'vượng'], ['Thất Sát', 'bình']],
    minors: ['Lộc Tồn', 'Thiên Khôi'], adjs: ['Ân Quang'], cs: 'Bệnh', bs: 'Phi Liêm', dr: '44-53' },
  { branch: 'Ngọ', name: 'Tử Tức', stem: 'Canh', majors: [],
    minors: ['Thiên Hình'], adjs: ['Thiên Quan'], cs: 'Tử', bs: 'Hỷ Thần', dr: '34-43' },
  { branch: 'Mùi', name: 'Phu Thê', stem: 'Tân', majors: [],
    minors: ['Tả Phù'], adjs: ['Hồng Loan', 'Thiên Hỷ'], cs: 'Mộ', bs: 'Bệnh Phù', dr: '24-33' },
  { branch: 'Thân', name: 'Huynh Đệ', stem: 'Nhâm', majors: [],
    minors: ['Văn Xương'], adjs: ['Thiên Vu'], cs: 'Tuyệt', bs: 'Đại Hao', dr: '14-23' },
  { branch: 'Dậu', name: 'Mệnh', stem: 'Quý', majors: [['Liêm Trinh', 'bình', 'Lộc'], ['Phá Quân', 'hãm', 'Quyền']],
    minors: ['Văn Xương', 'Kình Dương', 'Thiên Việt'], adjs: ['Hồng Loan', 'Long Trì'], cs: 'Thai', bs: 'Phục Binh', dr: '4-13' },
  { branch: 'Tuất', name: 'Phụ Mẫu', stem: 'Giáp', majors: [],
    minors: ['Thiên Khôi'], adjs: ['Thiên Thọ'], cs: 'Dưỡng', bs: 'Quan Phủ', dr: '114-123' },
  { branch: 'Hợi', name: 'Phúc Đức', stem: 'Ất', majors: [['Thiên Phủ', 'đắc']],
    minors: ['Hữu Bật'], adjs: ['Thiên Quý'], cs: 'Trường Sinh', bs: 'Bác Sĩ', dr: '104-113', than: true },
];

const star = (name: string, type: string, brightness?: string, mutagen?: string): StarData => ({
  name, type, ...(brightness ? { brightness } : {}), ...(mutagen ? { mutagen } : {}),
});

function toPalace(row: Row): PalaceData {
  const [start, end] = row.dr.split('-').map(Number);
  return {
    index: palaceIndexOf(row.branch),
    name: row.name,
    heavenlyStem: row.stem,
    earthlyBranch: row.branch,
    majorStars: row.majors.map(([n, b, m]) => star(n, 'major', b, m)),
    minorStars: row.minors.map((n) => star(n, 'soft')),
    adjectiveStars: row.adjs.map((n) => star(n, 'adjective')),
    isBodyPalace: !!row.than,
    isOriginalPalace: row.name === 'Mệnh',
    changsheng12: row.cs,
    boshi12: row.bs,
    decadalRange: row.dr,
    decadalHeavenlyStem: row.stem,
    decadalEarthlyBranch: row.branch,
    ages: Array.from({ length: 10 }, (_, i) => start + i).filter((a) => a <= end),
    suiqian12: '',
    jiangqian12: '',
  };
}

const PALACES = ROWS.map(toPalace);
const RUNNING = PALACES.find((p) => p.decadalRange === '24-33')!;

const INTERPRETATION = `## I. Mệnh cung — bản chất

Mệnh an tại **Dậu**, có **Liêm Trinh** (bình) đồng cung **Phá Quân** (hãm). Đây là cách cục của người hành động trước, giải thích sau: quyết đoán, chịu được va đập, và gần như không thể sống lâu trong một khuôn khổ do người khác đặt ra. Phá Quân hãm địa nói rằng những đổ vỡ trong đời không đến từ hoàn cảnh mà đến từ chính quyết định dứt bỏ của đương số — thường là dứt bỏ đúng, nhưng dứt bỏ sớm.

Điểm đáng chú ý nhất của lá số này nằm ở tứ hóa năm Giáp: **Liêm Trinh hóa Lộc** và **Phá Quân hóa Quyền** cùng rơi vào Mệnh. Cả tài lộc lẫn quyền quyết định đều tự thân mà có, không nhờ vào ai ban cho — nhưng cũng vì thế mà không ai gánh đỡ được khi chọn sai.

> Căn cứ: Mệnh · Dậu · Liêm Trinh (Lộc) + Phá Quân (Quyền) · xung chiếu Thiên Di (Mão) Thiên Tướng hãm.

## II. Đại vận 24–33 — vận đang đi

Đại vận hiện tại đóng ở **Phu Thê (Mùi)**, là cung **vô chính diệu** — không có chính tinh, phải mượn sao của cung đối là Sửu: **Vũ Khúc** (miếu, hóa Khoa) và **Tham Lang** (miếu). Một đại vận vô chính diệu không có nghĩa là trống rỗng; nó có nghĩa là giai đoạn này định hình bởi người khác và bởi quan hệ nhiều hơn bởi bản thân đương số.

Vũ Khúc hóa Khoa mượn vào cho thấy các mối quan hệ trong mười năm này có xu hướng thực tế, gắn với công việc và tiền bạc hơn là lãng mạn. Tham Lang miếu địa thêm sức hút và cơ hội, nhưng cũng thêm phần tính toán.

### Ba năm còn lại của vận

- **2026 (Bính Ngọ)** — lưu niên vào Tử Tức, năm thứ ba của vận: hợp để cam kết dài hạn, không hợp để mở rộng.
- **2027 (Đinh Mùi)** — lưu niên trùng cung đại vận, biến động rõ nhất trong cả mười năm.
- **2028 (Mậu Thân)** — chuyển tiếp sang đại vận 34–43, nên chuẩn bị từ cuối 2027.

## III. Điều nên nói thẳng

**Thái Dương hóa Kỵ** đóng tại Nô Bộc (Dần) là điểm yếu rõ ràng nhất của lá số. Hóa Kỵ ở cung bạn bè, cấp dưới không dự báo tai họa; nó dự báo hao tổn lặp lại vì tin người quá nhanh và giao việc quá sớm. Đây là chỗ nên đặt kỷ luật thành quy trình, chứ không nên trông vào cảm tính.

> Căn cứ: Nô Bộc · Dần · Thái Dương (Kỵ) vượng địa · tam hợp Ngọ – Tuất.`;

export const FIXTURE_INPUT: BirthInput = {
  name: 'Nguyễn Minh Anh',
  solarDate: '1994-03-14',
  birthHour: 6,
  gender: 'female',
  location: 'Việt Nam',
};

export const FIXTURE_RESULT: AnalysisResult = {
  chart: {
    gender: 'Dương Nữ',
    solarDate: '1994-03-14',
    lunarDate: '03-02-1994',
    chineseDate: 'Giáp Tuất · Đinh Mão · Bính Thìn',
    time: 'Ngọ',
    timeRange: '11:00–12:59',
    sign: 'Song Ngư',
    zodiac: 'Tuất',
    fiveElementsClass: 'Kim tứ cục',
    earthlyBranchOfSoulPalace: 'Dậu',
    earthlyBranchOfBodyPalace: 'Hợi',
    soul: 'Vũ Khúc',
    body: 'Thiên Tướng',
    palaces: PALACES,
    horoscope: {
      decadal: {
        index: RUNNING.index, name: 'Phu Thê', heavenlyStem: 'Tân', earthlyBranch: 'Mùi',
        palaceNames: [], mutagen: ['Khoa Vũ Khúc'],
      },
      yearly: {
        index: palaceIndexOf('Ngọ'), name: 'Tử Tức', heavenlyStem: 'Canh', earthlyBranch: 'Ngọ',
        palaceNames: [], mutagen: ['Lộc Thiên Đồng', 'Kỵ Liêm Trinh'],
      },
      monthly: {
        index: palaceIndexOf('Dậu'), name: 'Tài Bạch', heavenlyStem: 'Đinh', earthlyBranch: 'Dậu',
        palaceNames: [], mutagen: [],
      },
    },
  },
  interpretation: INTERPRETATION,
  decadalPeriods: PALACES
    .map((p) => {
      const [start, end] = p.decadalRange.split('-').map(Number);
      return {
        palaceIndex: p.index,
        palaceName: p.name,
        range: [start, end] as [number, number],
        heavenlyStem: p.decadalHeavenlyStem,
        earthlyBranch: p.decadalEarthlyBranch,
        majorStars: p.majorStars,
        minorStars: p.minorStars,
        adjectiveStars: p.adjectiveStars,
        mutagen: [],
        isCurrentDecadal: p.decadalRange === '24-33',
      };
    })
    .sort((a, b) => a.range[0] - b.range[0])
    .slice(0, 10),
};

export const FIXTURE_BIRTH_YEAR = BIRTH_YEAR;

/** True only outside production and only for the fixture id. */
export function fixtureEnabled(id: string | null): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return id === FIXTURE_ID;
}

/**
 * The only entry point for the result data. Returns null in production
 * regardless of the query string, so the fixture cannot be reached in the
 * deployed app.
 */
export function loadFixture(id: string | null): { result: AnalysisResult; input: BirthInput } | null {
  return fixtureEnabled(id) ? { result: FIXTURE_RESULT, input: FIXTURE_INPUT } : null;
}

/** Form prefill for the landing capture. Same guard. */
export function loadFixtureInput(id: string | null): BirthInput | null {
  return fixtureEnabled(id) ? FIXTURE_INPUT : null;
}
