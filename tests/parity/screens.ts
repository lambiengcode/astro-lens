export interface Viewport { name: string; width: number; height: number }

export const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

export interface Screen {
  /** Mockup section id and a short slug used for artefact filenames. */
  id: string;
  slug: string;
  /** Element captured on the reference page. */
  reference: string;
  /** Route on the live app, and the element captured there. */
  route: string;
  candidate: string;
  /** CSS applied to the candidate before capture (never to layout). */
  candidateSetup?: string;
  /** Focus this selector before capturing — reproduces a state the mockup shows. */
  focus?: string;
  /** Click these before capturing, to reach the state the mockup depicts. */
  click?: string[];
  /**
   * Regions blanked on BOTH sides before diffing. Every entry needs a reason
   * in PARITY.md; unexplained masks are how a parity claim becomes false.
   */
  masks?: {
    reference: string;
    /** Empty when the element exists only on the reference side. */
    candidate: string;
    /**
     * `hide` blanks the region but keeps its box (the default — it keeps the
     * surrounding layout honest). `collapse` takes it out of the flow, for the
     * cases where the excluded content's own width or height is what differs.
     */
    mode?: 'hide' | 'collapse';
    why: string;
  }[];
  /**
   * Selectors whose boxes must line up between reference and candidate. This
   * is the gate that actually tests PLAN.md §10.3's criteria — position, size
   * and spacing — independently of how a glyph was rasterised.
   */
  geometry: string[];
}

/** Present on every screen. */
const COMMON_GEOMETRY = ['.card', '.card-h', '.card-b'];

export const SCREENS: Screen[] = [
  {
    id: '01', slug: 'landing',
    reference: '#s1 .frame-body > .app',
    route: '/?fixture=tuvi-ty',
    candidate: '.app',
    focus: '#bf-date',
    // The app's form carries two fields the mockup never drew (nơi sinh, mô tả
    // bản thân). They are existing features feeding the Gemini prompt, so they
    // are taken out of the flow for this diff and verified separately.
    candidateSetup: '.field:has(#bf-loc), .field:has(#bf-self) { display: none !important }',
    masks: [
      {
        reference: '#s1 .appbar nav a:nth-of-type(2), #s1 .appbar nav a:nth-of-type(3)',
        candidate: '', mode: 'collapse',
        why: 'The mockup\'s appbar carries "Cách xem" and "Về thuật toán" — links to '
           + 'pages the app does not have. Shipping dead nav to win a pixel test would '
           + 'be inventing product surface, so the app keeps its real two-item nav and '
           + 'the reference\'s extra links are taken out of the comparison.',
      },
      {
        reference: '#s1 .hero .acts .btn:nth-of-type(2)',
        candidate: '', mode: 'collapse',
        why: 'The mockup\'s hero offers "Xem lá số mẫu". A working sample chart is a '
           + 'new feature (PLAN.md §1 non-goals) and the parity fixture is '
           + 'development-only, so the button has no destination in production.',
      },
    ],
    geometry: ['.appbar', '.brand', '.brand .mk', '.appbar nav', '.hero', '.hero-grid', '.eyebrow', '.hero h1', '.hero .sub', '.hero .acts', '.hero .acts .btn', '.labe', '.stats', '.stat', '.stat .v', '.band', '.prev', '.prev .ph', '.field', '.inp', '.seg', '.chk']
  },
  {
    id: '02', slug: 'overview',
    reference: '#s2 .frame-body > .app',
    route: '/result?fixture=tuvi-ty&tab=overview',
    candidate: '.app',
    geometry: [...COMMON_GEOMETRY, '.appbar', '.res-head', '.res-head h1', '.metaline', '.tabs', '.tabs a, .tabs button', '.res-body', '.kv', '.kv > div', '.kv .k', '.kv .v', '.hl', '.hl .k', '.hl .v']
  },
  {
    id: '03', slug: 'chart',
    reference: '#s3 .frame-body .res-body',
    route: '/result?fixture=tuvi-ty&tab=chart',
    candidate: '.res-body',
    // The mockup draws the drawer open on Cung Mệnh; open the same one.
    click: ['.pal.menh'],
    geometry: ['.chart', '.crow', '.cmid', '.pal', '.pal-b', '.pal-f', '.majors', '.maj', '.minors', '.adjs', '.centre', '.centre .ring', '.legend', '.drawer', '.drawer-h', '.drawer-b', '.dcol', '.dcol h5', '.dcol .li']
  },
  {
    id: '04', slug: 'daivan',
    reference: '#s4 .frame-body .res-body',
    route: '/result?fixture=tuvi-ty&tab=daivan',
    candidate: '.res-body',
    geometry: ['.dv-head', '.tl', '.tl-row', '.tl-row > div', '.ages', '.pn', '.sts', '.yrs', '.bar']
  },
  {
    id: '05', slug: 'reading',
    reference: '#s5 .frame-body .res-body',
    route: '/result?fixture=tuvi-ty&tab=interpretation',
    candidate: '.res-body',
    masks: [{
      reference: '#s5 .paper-foot span:last-child', candidate: '[data-parity-volatile]',
      mode: 'collapse',
      why: 'The mockup prints "Trang 3 / 5", a PDF page counter with no meaning on a '
         + 'scrolling screen; the app shows the reading\'s word count in the same slot. '
         + 'Collapsed rather than hidden because at 390px the two strings wrap the '
         + 'footer differently, and the wrap is a property of the excluded text.',
    }],
    geometry: ['.paper', '.paper-bar', '.pbtn', '.paper-b', '.doc-t', '.doc-m', '.paper-b h2', '.paper-b h3', '.paper-b p', '.paper-b ul', '.paper-b li', '.sealq', '.paper-foot', '.seal']
  },
  {
    id: '06', slug: 'horoscope',
    reference: '#s6 .frame-body .res-body',
    route: '/result?fixture=tuvi-ty&tab=horoscope',
    candidate: '.res-body',
    masks: [{
      reference: '#s6 .chat', candidate: '.chat',
      why: 'The mockup shows a mid-conversation with a model answer and a typing '
         + 'indicator. That state is only reachable through a live API call, so it '
         + 'cannot be made deterministic. The panel is verified separately — see the '
         + 'chat capture in PARITY.md.',
    }],
    geometry: // the chat is the masked region on this screen (see `masks`)
    [...COMMON_GEOMETRY, '.kv', '.kv > div']
  },
];
