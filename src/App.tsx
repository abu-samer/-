import { useState, useEffect, useMemo, useCallback } from 'react';
import { MatchConfig, Player, MatchRatingRecord } from './types';
import {
  loadSavedMatch,
  saveMatchConfig,
  isVotingOpen,
  DEFAULT_PLAYERS,
  formatFullArabicDate,
  getDeviceId,
  getVoterColorIndex,
} from './utils/helpers';
import { subscribeToSharedMatch, updateSharedMatch } from './firebase';
import PlayerBar from './components/PlayerBar';
import PlayerDetailCard from './components/PlayerDetailCard';
import AdminModal from './components/AdminModal';
import {
  Shield,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Cloud,
} from 'lucide-react';

export default function App() {
  const [matchData, setMatchData] = useState<MatchConfig>(() => loadSavedMatch());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    () => matchData.players[0]?.id || 'player-1'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Persistent unique identifier for this device
  const deviceId = useMemo(() => getDeviceId(), []);
  const myColorIndex = useMemo(() => getVoterColorIndex(deviceId), [deviceId]);

  // Admin authorization state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Simulation toggle for testing Wednesday lock on other days (admin-only)
  const [simulateVotingOpen, setSimulateVotingOpen] = useState<boolean | null>(null);

  // Subscribe to real-time shared Firestore match data
  useEffect(() => {
    const unsubscribe = subscribeToSharedMatch(
      (sharedMatch) => {
        setMatchData(sharedMatch);
        // If current selected player does not exist in updated list, select first available
        if (sharedMatch.players.length > 0) {
          setSelectedPlayerId((prev) => {
            const exists = sharedMatch.players.some((p) => p.id === prev);
            return exists ? prev : sharedMatch.players[0].id;
          });
        }
      },
      (err) => {
        console.warn('Realtime subscription error, using local data:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper to persist updates to shared cloud database
  const commitMatchUpdate = useCallback(async (newConfig: MatchConfig) => {
    setMatchData(newConfig);
    setIsSyncing(true);
    try {
      await updateSharedMatch(newConfig);
    } catch (err) {
      console.error('Failed to sync update to cloud:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Determine if today is Wednesday (Wednesday only)
  const realDateStatus = isVotingOpen();
  const votingIsOpen =
    simulateVotingOpen !== null ? simulateVotingOpen : realDateStatus.isOpen;
  const lockMessage = 'التصويت مغلق - متاح أيام الأربعاء فقط';

  // Get active selected player
  const selectedPlayer =
    matchData.players.find((p) => p.id === selectedPlayerId) || matchData.players[0];

  // Select adjacent player
  const currentIndex = matchData.players.findIndex((p) => p.id === selectedPlayerId);
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedPlayerId(matchData.players[currentIndex - 1].id);
    } else {
      setSelectedPlayerId(matchData.players[matchData.players.length - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < matchData.players.length - 1) {
      setSelectedPlayerId(matchData.players[currentIndex + 1].id);
    } else {
      setSelectedPlayerId(matchData.players[0].id);
    }
  };

  // Submit or Update Rating (1 rating per device per player per match session)
  const handleSubmitRating = async (playerId: string, score: number, commentText?: string) => {
    if (!votingIsOpen) return;

    const todayFormattedDate = formatFullArabicDate();

    const updatedPlayers = matchData.players.map((player) => {
      if (player.id !== playerId) return player;

      const currentHistory = player.history || [];
      const existingVoteIndex = currentHistory.findIndex(
        (h) => h.voterId === deviceId && h.date === todayFormattedDate
      );

      let newHistory: MatchRatingRecord[];

      if (existingVoteIndex >= 0) {
        // Update the device's existing vote for this match
        newHistory = currentHistory.map((rec, idx) =>
          idx === existingVoteIndex ? { ...rec, score, timestamp: Date.now() } : rec
        );
      } else {
        // Register a new distinct vote with voter number and distinct color
        const voterNumber = currentHistory.length + 1;
        const newRecord: MatchRatingRecord = {
          id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          voterId: deviceId,
          colorIndex: myColorIndex,
          voterNumber,
          date: todayFormattedDate,
          score,
          timestamp: Date.now(),
        };
        newHistory = [newRecord, ...currentHistory];
      }

      // Add optional comment with voter's color
      const newComments = commentText
        ? [
            {
              id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              voterId: deviceId,
              colorIndex: myColorIndex,
              text: commentText,
              timestamp: Date.now(),
            },
            ...player.comments,
          ]
        : player.comments;

      return {
        ...player,
        history: newHistory,
        comments: newComments,
      };
    });

    const newConfig: MatchConfig = {
      ...matchData,
      players: updatedPlayers,
    };

    await commitMatchUpdate(newConfig);
  };

  // Admin action: Add new player slot
  const handleAddPlayerSlot = async () => {
    if (!isAdmin) return;

    const nextNumber = matchData.players.length + 1;
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: `لاعب ${nextNumber}`,
      number: nextNumber,
      position: 'لاعب',
      ratings: [],
      history: [],
      comments: [],
    };

    const newConfig: MatchConfig = {
      ...matchData,
      players: [...matchData.players, newPlayer],
    };

    setSelectedPlayerId(newPlayer.id);
    await commitMatchUpdate(newConfig);
  };

  // Admin action: Rename a player
  const handleRenamePlayer = async (playerId: string, newName: string) => {
    if (!isAdmin) return;

    const newConfig: MatchConfig = {
      ...matchData,
      players: matchData.players.map((p) => (p.id === playerId ? { ...p, name: newName } : p)),
    };

    await commitMatchUpdate(newConfig);
  };

  // Admin action: Update player position in Arabic
  const handleUpdatePosition = async (playerId: string, newPosition: string) => {
    if (!isAdmin) return;

    const newConfig: MatchConfig = {
      ...matchData,
      players: matchData.players.map((p) => (p.id === playerId ? { ...p, position: newPosition } : p)),
    };

    await commitMatchUpdate(newConfig);
  };

  // Admin action: Update player avatar photo
  const handleUpdateAvatar = async (playerId: string, avatarUrl: string) => {
    if (!isAdmin) return;

    const newConfig: MatchConfig = {
      ...matchData,
      players: matchData.players.map((p) => (p.id === playerId ? { ...p, avatar: avatarUrl } : p)),
    };

    await commitMatchUpdate(newConfig);
  };

  // Admin action: Delete a player
  const handleDeletePlayer = async (playerId: string) => {
    if (!isAdmin) return;

    const remaining = matchData.players.filter((p) => p.id !== playerId);
    if (remaining.length > 0) {
      if (selectedPlayerId === playerId) {
        setSelectedPlayerId(remaining[0].id);
      }
    } else {
      setSelectedPlayerId('');
    }

    const newConfig: MatchConfig = {
      ...matchData,
      players: remaining,
    };

    await commitMatchUpdate(newConfig);
  };

  // Admin action: Reset all ratings to clean zero
  const handleReset = async () => {
    if (!isAdmin) {
      alert('يجب تفعيل صلاحية المسؤول أولاً لإعادة ضبط التشكيلة والتقييمات.');
      return;
    }
    const freshConfig: MatchConfig = {
      matchTitle: 'تقييمات مباراة الأربعاء',
      matchDate: formatFullArabicDate(),
      players: DEFAULT_PLAYERS,
    };
    setSelectedPlayerId(DEFAULT_PLAYERS[0].id);
    await commitMatchUpdate(freshConfig);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center selection:bg-emerald-500 selection:text-neutral-950 font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Right: Title & Date */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-sm font-bold tracking-tight text-white">
                تقييمات لاعبي مباراة الأربعاء
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
              <Calendar className="w-3 h-3 text-neutral-500" />
              <span>مباريات كرة القدم كل أربعاء</span>
            </div>
          </div>

          {/* Left: Day status & Shield Admin Box */}
          <div className="flex items-center gap-2">
            {/* Voting Status Badge */}
            {votingIsOpen ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>التصويت مفتوح اليوم</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-medium">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>التصويت مقفل</span>
              </span>
            )}

            {/* Shield Admin Square Button */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title={isAdmin ? 'وضع المسؤول مفعل (انقر للإدارة أو القفل)' : 'لوحة تحكم المسؤول (أدخل كلمة السر)'}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-sm ${
                isAdmin
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold ring-2 ring-emerald-500/30'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-neutral-950" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </button>

            {/* Admin-only simulation toggle */}
            {isAdmin && (
              <button
                onClick={() =>
                  setSimulateVotingOpen((prev) => (prev === null ? !realDateStatus.isOpen : null))
                }
                title="خاص بالأدمن: تجربة فتح أو قفل التصويت (محاكاة يوم الأربعاء)"
                className={`text-[10px] px-2 py-1 rounded border transition-colors cursor-pointer ${
                  simulateVotingOpen !== null
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {simulateVotingOpen !== null ? 'محاكاة: مفتوح' : 'محاكاة الأربعاء'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl px-4 py-5 flex-1 flex flex-col gap-5">
        {/* Admin Banner if active */}
        {isAdmin && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>وضع المسؤول مفعل:</strong> يمكنك كتابة وتعديل أسماء اللاعبين، تحديد مراكزهم بالعربي، رفع صورهم، وإضافة أو حذف أي لاعب.
              </span>
            </div>
            <button
              onClick={() => setIsAdmin(false)}
              className="text-[11px] underline hover:text-white mr-2 cursor-pointer whitespace-nowrap"
            >
              قفل الوضع
            </button>
          </div>
        )}

        {/* Day-Lock Alert if today is not Wednesday */}
        {!votingIsOpen && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-right">
              <p className="font-bold text-neutral-200">
                التصويت مقفل حالياً
              </p>
              <p className="text-neutral-400 mt-0.5 leading-relaxed">
                التصويت على تقييمات اللاعبين متاح حصراً في{' '}
                <strong className="text-neutral-200">يوم الأربعاء فقط</strong> بمعدل تقييم واحد لكل جهاز لكل مباراة.
              </p>
            </div>
          </div>
        )}

        {/* 1. Horizontal Scrollable Player Selector Bar */}
        <section>
          <PlayerBar
            players={matchData.players}
            selectedPlayerId={selectedPlayerId}
            isAdmin={isAdmin}
            onSelectPlayer={(player) => setSelectedPlayerId(player.id)}
            onAddPlayer={handleAddPlayerSlot}
          />
        </section>

        {/* 2. Focused Player Detail & Rating Card */}
        {selectedPlayer ? (
          <section className="flex-1">
            <PlayerDetailCard
              key={selectedPlayer.id}
              player={selectedPlayer}
              matchDate={matchData.matchDate}
              deviceId={deviceId}
              isLocked={!votingIsOpen}
              isAdmin={isAdmin}
              lockMessage={lockMessage}
              onSubmitRating={handleSubmitRating}
              onRenamePlayer={handleRenamePlayer}
              onUpdatePosition={handleUpdatePosition}
              onUpdateAvatar={handleUpdateAvatar}
              onDeletePlayer={handleDeletePlayer}
              onPreviousPlayer={handlePrevious}
              onNextPlayer={handleNext}
            />
          </section>
        ) : (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
            <p className="text-sm text-neutral-400">لا يوجد أي لاعب في التشكيلة حالياً.</p>
            {isAdmin && (
              <button
                onClick={handleAddPlayerSlot}
                className="mt-3 px-4 py-2 bg-emerald-500 text-neutral-950 font-bold rounded-xl text-xs"
              >
                إضافة لاعب جديد
              </button>
            )}
          </div>
        )}
      </main>

      {/* Admin Password Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        isAdmin={isAdmin}
        simulateVotingOpen={simulateVotingOpen}
        onToggleSimulate={() =>
          setSimulateVotingOpen((prev) => (prev === null ? !realDateStatus.isOpen : null))
        }
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={() => setIsAdmin(true)}
        onLogout={() => setIsAdmin(false)}
      />

      {/* Minimal Footer */}
      <footer className="w-full border-t border-neutral-900 py-4 px-4 text-xs text-neutral-500 flex items-center justify-between max-w-2xl">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>نظام تقييم نظيف • تقييم واحد لكل جهاز لكل مباراة</span>
        </span>
        {isAdmin && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer text-neutral-500"
          >
            <RotateCcw className="w-3 h-3" />
            <span>تصفير وإعادة ضبط التشكيلة</span>
          </button>
        )}
      </footer>
    </div>
  );
}
