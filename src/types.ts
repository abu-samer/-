export interface PlayerComment {
  id: string;
  voterId?: string;
  colorIndex?: number;
  text: string;
  timestamp: number;
}

export interface MatchRatingRecord {
  id: string;
  voterId: string; // unique device identifier
  colorIndex: number; // index into distinct color palette
  voterNumber: number; // e.g., 1 for first voter, 2 for second voter, etc.
  date: string; // e.g., "الأربعاء، 9 سبتمبر 2026"
  score: number;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  number?: number;
  avatar?: string;
  position?: string;
  ratings: number[];
  history: MatchRatingRecord[];
  comments: PlayerComment[];
}

export interface MatchConfig {
  matchTitle: string;
  matchDate: string;
  players: Player[];
}
