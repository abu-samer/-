import { Player } from '../types';
import { getPlayerAverage, getPlayerInitials } from '../utils/helpers';
import { Star, Plus } from 'lucide-react';

interface PlayerBarProps {
  players: Player[];
  selectedPlayerId: string | null;
  isAdmin: boolean;
  onSelectPlayer: (player: Player) => void;
  onAddPlayer: () => void;
}

export default function PlayerBar({
  players,
  selectedPlayerId,
  isAdmin,
  onSelectPlayer,
  onAddPlayer,
}: PlayerBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold tracking-wider text-neutral-400">
          قائمة لاعبي الفريق ({players.length})
        </span>

        {/* Add Player button ONLY visible for Admin */}
        {isAdmin && (
          <button
            onClick={onAddPlayer}
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة لاعب</span>
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Track */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none snap-x">
        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          const avg = getPlayerAverage(player);
          const initials = getPlayerInitials(player.name);

          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className={`group flex-shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer snap-start text-right ${
                isSelected
                  ? 'bg-neutral-800 border-neutral-600 ring-1 ring-emerald-500/50 shadow-md'
                  : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Photo or Initials Badge */}
              <div
                className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs tracking-wider transition-colors border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500 text-neutral-950'
                    : 'border-neutral-750 bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700'
                }`}
              >
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Name, Position & Rating */}
              <div className="min-w-[75px]">
                <p
                  className={`text-xs font-bold truncate transition-colors ${
                    isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'
                  }`}
                >
                  {player.name}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  {player.position && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-1.5 py-0.2 rounded font-medium truncate max-w-[60px]">
                      {player.position}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <Star
                      className={`w-3 h-3 ${
                        avg !== null
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-600'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        avg !== null ? 'text-amber-400' : 'text-neutral-500'
                      }`}
                    >
                      {avg !== null ? avg : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
