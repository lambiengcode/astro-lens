// Candidate-screen star profiles — en. Keys stay Vietnamese. See `./vi.ts`.
import type { Profiles } from './types';

const en: Profiles = {
  empty: [
    'The Adaptable One',
    ['Easy-going', 'Adaptable', 'Impressionable'],
    'Fits into many environments without stiffening — gets on with a wide range of people.',
    'Sometimes short of a clear direction, and more easily led by those nearby than by an inner will.',
  ],

  single: {
    'Tử Vi': [
      'The Leader',
      ['Ambitious', 'Commanding', 'Perfectionist'],
      'Born to take charge — draws respect without asking for it, and sees the whole board.',
      'Finds it hard to share power, and can be alone at the top because nobody meets the standard.',
    ],
    'Thiên Cơ': [
      'The Strategist',
      ['Quick-minded', 'Resourceful', 'Hesitant'],
      'Thinks fast, reads a situation well and finds the creative way through.',
      'Thinks too long before moving, and misses the moment while still calculating.',
    ],
    'Thái Dương': [
      'The Radiant One',
      ['Warm', 'Generous', 'Outgoing'],
      'Lifts the people nearby — open-handed, and reliably good energy in a room.',
      'Needs to be seen; without attention the drive fades and the mood sinks.',
    ],
    'Vũ Khúc': [
      'The Doer',
      ['Decisive', 'Practical', 'Independent'],
      'Says little and delivers — turns a plan into a concrete result.',
      'Impatient with anyone slower, and can read as cold or inflexible.',
    ],
    'Thiên Đồng': [
      'The Peacemaker',
      ['Kind', 'Easy company', 'Values calm'],
      'Liked without trying, and good at making a group feel settled.',
      'Avoids conflict to the point of not speaking plainly, and is easily talked over.',
    ],
    'Liêm Trinh': [
      'The Principled One',
      ['Sharp', 'Principled', 'Complicated'],
      'Absolutely loyal to what they believe, and an acute judge of people.',
      'Hard to read and often mistaken for cold — in fact deeply feeling, and keeping it hidden.',
    ],
    'Thiên Phủ': [
      'The Builder',
      ['Steady', 'Accumulating', 'Dependable'],
      'Builds patiently, step by step, and is good at preserving and growing what is held.',
      'Little appetite for risk or novelty, and misses openings by being too careful.',
    ],
    'Thái Âm': [
      'The Perceiver',
      ['Sensitive', 'Strongly intuitive', 'Subtle'],
      'Reads other people very fast, and the intuition is right more often than the logic.',
      'Wounded easily when not valued, and tends to carry other people’s feelings as well.',
    ],
    'Tham Lang': [
      'The Explorer',
      ['Versatile', 'Magnetic', 'Craves experience'],
      'Picks anything up quickly, with natural pull — the centre of attention in any crowd.',
      'Bores fast and keeps changing, so rarely stays with one field long enough to top it.',
    ],
    'Cự Môn': [
      'The Thinker',
      ['Analytical', 'Direct', 'Argumentative'],
      'Sees straight through a problem, and speaks with weight — persuades by logic and evidence.',
      'Direct enough to start arguments, and sometimes too sceptical to trust anyone.',
    ],
    'Thiên Tướng': [
      'The Protector',
      ['Fair', 'Responsible', 'Honest'],
      'Makes other people feel safe — principled, trustworthy, and never disloyal.',
      'Can hold the rule too rigidly, and struggles to bend when the case calls for an exception.',
    ],
    'Thiên Lương': [
      'The Healer',
      ['Compassionate', 'Helpful', 'Upright'],
      'Helps and heals by instinct — trusted by elders, and often the one others come to.',
      'Gives to the point of forgetting themselves, and the kindness is easy to exploit.',
    ],
    'Thất Sát': [
      'The Pioneer',
      ['Tough', 'Forceful', 'Unafraid of hard ground'],
      'Does not step back under pressure, and takes on what others will not.',
      'Carries it alone too often, and is poor at both asking for help and compromising.',
    ],
    'Phá Quân': [
      'The Breaker',
      ['Distinctive', 'Bold', 'Off the beaten track'],
      'Dares to break what no longer fits — first through, inventive, and unconstrained.',
      'Often breaks before knowing what to build, so neither work nor love settles for long.',
    ],
  },

  combo: {
    'Tử Vi+Thiên Phủ': [
      'The Sovereign',
      ['Commanding and solid', 'Ambitious', 'Accumulating'],
      'Leadership weight on a stable base — few people earn both compliance and respect.',
      'So complete it becomes hard to approach; people admire, and hesitate to stand close.',
    ],
    'Tử Vi+Tham Lang': [
      'The Versatile Leader',
      ['Magnetic', 'Ambitious', 'Energetic'],
      'Authority and personal pull together — wins people over and makes openings.',
      'Wants too many things at once, and scatters the effort instead of taking one summit.',
    ],
    'Tử Vi+Phá Quân': [
      'The Reformer',
      ['Breakthrough', 'Authoritative', 'Unafraid of risk'],
      'Big view with the nerve to act on it — the right shape for leading a real change.',
      'Moves faster than the people around them, and meets resistance when altering old structures.',
    ],
    'Thái Dương+Thái Âm': [
      'The Balanced One',
      ['Warm', 'Sensitive', 'Two-sided'],
      'Outward and inwardly deep at once — understands people, and knows how to lift them.',
      'Swings between warmth and rawness, and needs a steady setting to come into their own.',
    ],
    'Thái Dương+Thiên Lương': [
      'The Inspirer',
      ['Warm', 'Compassionate', 'Helpful'],
      'Good energy with real kindness behind it — becomes the support many people lean on.',
      'Takes on far too much of other people’s weight, and must learn to refuse without guilt.',
    ],
    'Vũ Khúc+Thiên Tướng': [
      'The Administrator',
      ['Practical', 'Fair', 'Systematic'],
      'Execution and fairness together — suited to running and managing an organisation.',
      'Sometimes so focused on process and result that the people inside it are missed.',
    ],
    'Vũ Khúc+Thất Sát': [
      'The Vanguard',
      ['Fierce', 'Independent', 'Action-first'],
      'Waits for nobody and goes first — suited to founding, and to roles that need nerve.',
      'Travels alone too often, coordinates poorly, and overlooks how collaborators feel.',
    ],
    'Vũ Khúc+Phá Quân': [
      'The Trailblazer',
      ['Bold', 'Pragmatic', 'Unafraid of failing'],
      'Tries what others will not — action and rupture together, right for opening new ground.',
      'Lets go halfway once a new direction appears, short on patience to finish what was begun.',
    ],
    'Liêm Trinh+Thiên Phủ': [
      'The Long-game Strategist',
      ['Principled', 'Accumulating', 'Deep'],
      'Sharp judgement with the patience to build — keeps something of value going for a long time.',
      'Closed and hard to read; new acquaintances hesitate, though the trust is well placed.',
    ],
    'Liêm Trinh+Thất Sát': [
      'The Unyielding One',
      ['Steadfast', 'Uncompromising', 'Nervy'],
      'Unmoved by pressure or temptation — faithful to the principle even when it costs.',
      'Sometimes so hard that they will not give, even where the situation needs give.',
    ],
    'Liêm Trinh+Phá Quân': [
      'The Principled Rebel',
      ['Distinctive', 'Sharp', 'Against the worn path'],
      'Breaks the convention without breaking their own rule — independent, and hard to predict.',
      'Draws controversy, and is not easily accepted in a conservative setting.',
    ],
    'Liêm Trinh+Tham Lang': [
      'The Complicated Charmer',
      ['Magnetic', 'Enigmatic', 'Principles kept hidden'],
      'An unusual pull with real inner depth — draws people in a way nobody quite explains.',
      'Easily pulled into complicated attachments or temptations; needs strong self-discipline.',
    ],
    'Thiên Đồng+Thái Âm': [
      'The Nurturer',
      ['Sensitive', 'Attentive', 'Calm'],
      'Makes a safe space for other people — anyone beside them feels actually heard.',
      'Puts others so far first that their own needs are forgotten, and burns out emotionally.',
    ],
    'Thiên Đồng+Cự Môn': [
      'The Counsellor',
      ['Kind', 'Analytical', 'Well-spoken'],
      'Understands people and analyses well — suited to advising, counselling, resolving disputes.',
      'Caught between keeping the peace and saying the true thing, and can struggle to land on one.',
    ],
  },
};

export default en;
