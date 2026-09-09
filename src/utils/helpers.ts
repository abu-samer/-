import { MatchConfig, Player, MatchRatingRecord } from '../types';

const STORAGE_KEY = 'wednesday_match_ratings_v3_clean';
export const ADMIN_PASSWORD = '123456789';

// Vibrant distinct color themes for different voters
export const VOTER_COLORS = [
  {
    name: 'أخضر زمردي',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500 text-neutral-950',
  },
  {
    name: 'أزرق سماوي',
    bg: 'bg-sky-500/15',
    border: 'border-sky-500/40',
    text: 'text-sky-400',
    pill: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    dot: 'bg-sky-400',
    badge: 'bg-sky-500 text-neutral-950',
  },
  {
    name: 'بنفسجي ملكي',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    pill: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    badge: 'bg-purple-500 text-neutral-950',
  },
  {
    name: 'كهرماني ذهبي',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500 text-neutral-950',
  },
  {
    name: 'وردي ياقوتي',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    badge: 'bg-rose-500 text-neutral-950',
  },
  {
    name: 'تركواز بحري',
    bg: 'bg-teal-500/15',
    border: 'border-teal-500/40',
    text: 'text-teal-400',
    pill: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    dot: 'bg-teal-400',
    badge: 'bg-teal-500 text-neutral-950',
  },
  {
    name: 'برتقالي ناري',
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    pill: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    dot: 'bg-orange-400',
    badge: 'bg-orange-500 text-neutral-950',
  },
  {
    name: 'نيلي عميق',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
    pill: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    badge: 'bg-indigo-500 text-neutral-950',
  },
];

// Helper to get formatted Arabic date with Day, Month, Year
export function formatFullArabicDate(date: Date = new Date()): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

// Persistent Device ID
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem('match_device_voter_id_v1');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('match_device_voter_id_v1', id);
    }
    return id;
  } catch {
    return 'dev_fallback_guest';
  }
}

// Compute deterministic color index from a voter ID
export function getVoterColorIndex(voterId: string): number {
  let hash = 0;
  for (let i = 0; i < voterId.length; i++) {
    hash = (hash << 5) - hash + voterId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % VOTER_COLORS.length;
}

// CLEAN SQUAD: Completely zeroed out, no mock historical data
export const DEFAULT_PLAYERS: Player[] = [
  { id: 'player-1', name: 'لاعب 1', number: 1, position: 'حارس مرمى', ratings: [], history: [], comments: [] },
  { id: 'player-2', name: 'لاعب 2', number: 2, position: 'مدافع', ratings: [], history: [], comments: [] },
  { id: 'player-3', name: 'لاعب 3', number: 3, position: 'مدافع', ratings: [], history: [], comments: [] },
  { id: 'player-4', name: 'لاعب 4', number: 4, position: 'خط وسط', ratings: [], history: [], comments: [] },
  { id: 'player-5', name: 'لاعب 5', number: 5, position: 'خط وسط', ratings: [], history: [], comments: [] },
  { id: 'player-6', name: 'لاعب 6', number: 6, position: 'مهاجم', ratings: [], history: [], comments: [] },
  { id: 'player-7', name: 'لاعب 7', number: 7, position: 'مهاجم', ratings: [], history: [], comments: [] },
  { id: 'player-8', name: 'لاعب 8', number: 8, position: 'لاعب', ratings: [], history: [], comments: [] },
  { id: 'player-9', name: 'لاعب 9', number: 9, position: 'لاعب', ratings: [], history: [], comments: [] },
  { id: 'player-10', name: 'لاعب 10', number: 10, position: 'لاعب', ratings: [], history: [], comments: [] },
];

export const DEFAULT_MATCH: MatchConfig = {
  matchTitle: 'تقييمات مباراة الأربعاء',
  matchDate: formatFullArabicDate(),
  players: DEFAULT_PLAYERS,
};

// Check if today is Wednesday (day === 3 in JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
export function isVotingOpen(overrideDate?: Date): {
  isOpen: boolean;
  dayName: string;
  message: string;
} {
  const now = overrideDate || new Date();
  const day = now.getDay();
  const dayNamesArabic = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];
  const dayName = dayNamesArabic[day];

  // Wednesday ONLY (day === 3)
  const isOpen = day === 3;

  return {
    isOpen,
    dayName,
    message: isOpen
      ? 'التصويت مفتوح اليوم (الأربعاء)'
      : 'التصويت مغلق - متاح أيام الأربعاء فقط',
  };
}

export function getPlayerAverage(player: Player): number | null {
  if (!player.history || player.history.length === 0) {
    if (!player.ratings || player.ratings.length === 0) return null;
    const sum = player.ratings.reduce((a, b) => a + b, 0);
    return Number((sum / player.ratings.length).toFixed(1));
  }
  const sum = player.history.reduce((a, b) => a + b.score, 0);
  return Number((sum / player.history.length).toFixed(1));
}

export function getPlayerInitials(name: string): string {
  if (!name) return '??';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2);
  }
  return parts[0][0] + ' ' + parts[parts.length - 1][0];
}

export function formatTimeAgoArabic(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'الآن';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return 'منذ دقيقة';
  if (diffMin === 2) return 'منذ دقيقتين';
  if (diffMin < 11) return `منذ ${diffMin} دقائق`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours < 11) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'أمس';
  if (diffDays === 2) return 'منذ يومين';
  if (diffDays < 11) return `منذ ${diffDays} أيام`;
  return `منذ ${diffDays} يوم`;
}

// Check if this device already voted for this player in the given match date
export function getDeviceVote(
  player: Player,
  deviceId: string,
  matchDate: string
): MatchRatingRecord | undefined {
  if (!player.history) return undefined;
  return player.history.find(
    (record) => record.voterId === deviceId && record.date === matchDate
  );
}

export function loadSavedMatch(): MatchConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        parsed.players = parsed.players.map((p: Player) => ({
          ...p,
          ratings: Array.isArray(p.ratings) ? p.ratings : [],
          history: Array.isArray(p.history) ? p.history : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
        }));
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved ratings:', err);
  }
  return DEFAULT_MATCH;
}

export function saveMatchConfig(data: MatchConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save ratings:', err);
  }
}
