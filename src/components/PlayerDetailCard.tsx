import { useState, useId, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Player, MatchRatingRecord } from '../types';
import {
  getPlayerAverage,
  getPlayerInitials,
  formatTimeAgoArabic,
  VOTER_COLORS,
  getDeviceVote,
} from '../utils/helpers';
import {
  Star,
  Lock,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Check,
  Trash2,
  Camera,
  History,
  ShieldAlert,
  X,
  Calendar,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface PlayerDetailCardProps {
  key?: string;
  player: Player;
  matchDate: string;
  deviceId: string;
  isLocked: boolean;
  isAdmin: boolean;
  lockMessage: string;
  onClose?: () => void;
  onSubmitRating: (playerId: string, rating: number, comment?: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  onUpdatePosition: (playerId: string, newPosition: string) => void;
  onUpdateAvatar: (playerId: string, avatarUrl: string) => void;
  onDeletePlayer: (playerId: string) => void;
  onDeleteRatingRecord?: (playerId: string, recordId: string) => void;
  onClearPlayerRatings?: (playerId: string) => void;
  onDeleteComment?: (playerId: string, commentId: string) => void;
  onClearPlayerComments?: (playerId: string) => void;
  onPreviousPlayer?: () => void;
  onNextPlayer?: () => void;
}

export default function PlayerDetailCard({
  player,
  matchDate,
  deviceId,
  isLocked,
  isAdmin,
  lockMessage,
  onSubmitRating,
  onRenamePlayer,
  onUpdatePosition,
  onUpdateAvatar,
  onDeletePlayer,
  onDeleteRatingRecord,
  onClearPlayerRatings,
  onDeleteComment,
  onClearPlayerComments,
  onPreviousPlayer,
  onNextPlayer,
}: PlayerDetailCardProps) {
  // Check if current device already submitted a rating for this match
  const existingVote: MatchRatingRecord | undefined = getDeviceVote(player, deviceId, matchDate);
  const hasAlreadyVoted = !!existingVote;

  const [selectedScore, setSelectedScore] = useState<number>(() => existingVote?.score || 8);
  const [commentText, setCommentText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isEditingVote, setIsEditingVote] = useState(false);

  // Edit Name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(player.name);

  // Edit Position
  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [editPositionValue, setEditPositionValue] = useState(player.position || '');

  // Edit Photo Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline Delete Confirmation
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isConfirmingClearRatings, setIsConfirmingClearRatings] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isConfirmingClearComments, setIsConfirmingClearComments] = useState(false);

  const sliderInputId = useId();

  const avg = getPlayerAverage(player);
  const initials = getPlayerInitials(player.name);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (hasAlreadyVoted && !isEditingVote) return;

    onSubmitRating(player.id, selectedScore, commentText.trim() || undefined);
    setCommentText('');
    setIsEditingVote(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 2500);
  };

  const handleSaveName = () => {
    if (editNameValue.trim()) {
      onRenamePlayer(player.id, editNameValue.trim());
    }
    setIsEditingName(false);
  };

  const handleSavePosition = () => {
    onUpdatePosition(player.id, editPositionValue.trim());
    setIsEditingPosition(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateAvatar(player.id, reader.result);
        setIsPhotoModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhotoUrl = (e: FormEvent) => {
    e.preventDefault();
    if (photoUrlInput.trim()) {
      onUpdateAvatar(player.id, photoUrlInput.trim());
      setPhotoUrlInput('');
      setIsPhotoModalOpen(false);
    }
  };

  const handleRemovePhoto = () => {
    onUpdateAvatar(player.id, '');
    setIsPhotoModalOpen(false);
  };

  const executeDelete = () => {
    onDeletePlayer(player.id);
    setIsConfirmingDelete(false);
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transition-all text-right">
      {/* Inline Delete Confirmation Alert */}
      {isConfirmingDelete && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 p-3.5 flex items-center justify-between gap-3 text-rose-200 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              هل أنت متأكد من حذف اللاعب <strong>"{player.name}"</strong> نهائياً من التشكيلة؟
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={executeDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              نعم، احذف
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800/80 bg-neutral-900/60">
        <div className="flex items-center gap-3.5">
          {/* Square Photo Badge */}
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700/80 flex items-center justify-center font-bold text-base text-emerald-400 overflow-hidden shadow-inner">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">{initials}</span>
              )}
            </div>

            {/* Admin Camera Button */}
            {isAdmin && (
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                title="إضافة أو تغيير صورة اللاعب"
                className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-neutral-900"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            {/* Player Name Row */}
            {isEditingName && isAdmin ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  placeholder="اسم اللاعب..."
                  className="bg-neutral-800 border border-neutral-700 text-white text-sm px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-emerald-500 text-neutral-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                  title="حفظ الاسم"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {player.name}
                </h2>
                {isAdmin && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      onClick={() => {
                        setEditNameValue(player.name);
                        setIsEditingName(true);
                      }}
                      title="تعديل اسم اللاعب"
                      className="text-neutral-400 hover:text-emerald-400 p-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800 px-1.5 py-0.5 rounded-lg animate-in fade-in">
                        <span className="text-[10px] text-rose-200">حذف اللاعب؟</span>
                        <button
                          onClick={executeDelete}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                        >
                          نعم
                        </button>
                        <button
                          onClick={() => setIsConfirmingDelete(false)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors"
                        >
                          لا
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsConfirmingDelete(true)}
                        title="حذف اللاعب"
                        className="text-neutral-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Position Badge & Admin Position Editor */}
            <div className="flex items-center gap-2 mt-1">
              {isEditingPosition && isAdmin ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={editPositionValue}
                    onChange={(e) => setEditPositionValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePosition()}
                    autoFocus
                    placeholder="اكتب المركز بالعربي..."
                    className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2 py-0.5 rounded focus:outline-none focus:border-emerald-500 w-36"
                  />
                  <button
                    onClick={handleSavePosition}
                    className="p-1 bg-emerald-500 text-neutral-950 rounded hover:bg-emerald-400 cursor-pointer"
                    title="حفظ المركز"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                    {player.position || 'غير محدد'}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditPositionValue(player.position || '');
                        setIsEditingPosition(true);
                      }}
                      title="تعديل مركز اللاعب بالعربي"
                      className="text-neutral-500 hover:text-neutral-300 text-[11px] flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>تعديل المركز</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Player Name and Position */}
          </div>
        </div>

        {/* Quick Prev / Next Navigator */}
        <div className="flex items-center gap-1.5">
          {onPreviousPlayer && (
            <button
              onClick={onPreviousPlayer}
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="اللاعب السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onNextPlayer && (
            <button
              onClick={onNextPlayer}
              className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
              title="اللاعب التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Rating Overview Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              معدل تقييم اللاعب
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {avg !== null ? avg : '—'}
              </span>
              <span className="text-sm font-medium text-neutral-500">/ 10</span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between text-left">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-xs font-semibold text-neutral-300">
                {player.history.length === 0
                  ? 'لا توجد تقييمات مسجلة بعد'
                  : `${player.history.length} ${
                      player.history.length === 1 ? 'تقييم' : 'تقييمات'
                    }`}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5">
              تقييم واحد لكل جهاز بكل مباراة
            </span>
          </div>
        </div>

        {/* Status: Has already voted from this device */}
        {hasAlreadyVoted && !isEditingVote && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>تم التصويت من جهازك:</strong> لقد قيمت هذا اللاعب بـ{' '}
                <strong className="underline text-white font-bold">{existingVote?.score} / 10</strong> لهذه المباراة.
              </span>
            </div>
            {!isLocked && (
              <button
                type="button"
                onClick={() => {
                  setSelectedScore(existingVote.score);
                  setIsEditingVote(true);
                }}
                className="text-[11px] font-bold text-emerald-400 hover:text-white underline cursor-pointer whitespace-nowrap"
              >
                تعديل تقييمي
              </button>
            )}
          </div>
        )}

        {/* Rating Submission Form (Wednesdays Only) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Lock Banner if locked */}
          {isLocked && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>{lockMessage}</span>
            </div>
          )}

          {/* 1 - 10 Score Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={sliderInputId} className="text-xs font-semibold text-neutral-300">
                {hasAlreadyVoted && !isEditingVote
                  ? 'تقييمك الحالي المسجل من هذا الجهاز'
                  : 'اختر تقييمك لمباراة الأربعاء'}
              </label>
              <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {selectedScore} من 10
              </span>
            </div>

            {/* Tap buttons 1-10 */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = selectedScore === num;
                const isDisabled = isLocked || (hasAlreadyVoted && !isEditingVote);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedScore(num)}
                    className={`py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-neutral-950 ring-2 ring-emerald-400 shadow-md font-black'
                        : isDisabled
                        ? 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed border border-neutral-800'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700/60'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Range Slider */}
            <input
              id={sliderInputId}
              type="range"
              min="1"
              max="10"
              step="1"
              disabled={isLocked || (hasAlreadyVoted && !isEditingVote)}
              value={selectedScore}
              onChange={(e) => setSelectedScore(Number(e.target.value))}
              aria-label="شريط التقييم من 1 إلى 10"
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-neutral-800 ${
                isLocked || (hasAlreadyVoted && !isEditingVote)
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>1 (ضعيف)</span>
              <span>5 (متوسط)</span>
              <span>10 (رجل المباراة / أسطوري)</span>
            </div>
          </div>

          {/* Optional Short Anonymous Comment Box (Only visible if not voted or editing) */}
          {(!hasAlreadyVoted || isEditingVote) && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                ملاحظة أو تعليق مجهول (اختياري)
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  isLocked
                    ? 'التصويت والتعليقات مقفلة حالياً (تفتح يوم الأربعاء)'
                    : 'اكتب تعليقك أو ملاحظتك بشكل مجهول تماماً بدون اسم...'
                }
                maxLength={240}
                className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <div className="flex justify-start text-[10px] text-neutral-500 mt-0.5">
                <span>{commentText.length}/240 حرف</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            {isLocked ? (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-neutral-800/80 border border-neutral-700/40 text-neutral-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lockMessage}</span>
              </button>
            ) : hasAlreadyVoted && !isEditingVote ? (
              <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-800/70 border border-neutral-700/50 text-neutral-400 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم تسجيل تقييمك لمباراة اليوم من هذا الجهاز</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                      <span>تم تسجيل التقييم بنجاح!</span>
                    </>
                  ) : isEditingVote ? (
                    <span>حفظ التعديل على تقييمي</span>
                  ) : (
                    <span>تأكيد إرسال التقييم</span>
                  )}
                </button>
                {isEditingVote && (
                  <button
                    type="button"
                    onClick={() => setIsEditingVote(false)}
                    className="px-3 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        {/* SECTION: History Ratings with Voter Color-Coding */}
        <div className="border-t border-neutral-800/80 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-neutral-200">
                سجل التقييمات المسجلة ({player.history.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && player.history.length > 0 && onClearPlayerRatings && (
                <div>
                  {isConfirmingClearRatings ? (
                    <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800 px-2 py-0.5 rounded-lg animate-in fade-in">
                      <span className="text-[10px] text-rose-200">مسح كل تقييمات اللاعب؟</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClearPlayerRatings(player.id);
                          setIsConfirmingClearRatings(false);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                      >
                        نعم، مسح
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearRatings(false)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearRatings(true)}
                      className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      title="خاص بالأدمن: تصفير جميع تقييمات هذا اللاعب"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>مسح كل التقييمات</span>
                    </button>
                  )}
                </div>
              )}
              <span className="text-[10px] text-neutral-500 hidden sm:inline">
                لكل مقيّم لون مميز خاص به
              </span>
            </div>
          </div>

          {player.history.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/50 text-center">
              <p className="text-xs text-neutral-500">
                لم يتم تسجيل أي تقييمات لهذا اللاعب حتى الآن. التقييمات تبدأ من الصفر لمباراة الأربعاء.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {player.history.map((record) => {
                const color = VOTER_COLORS[record.colorIndex % VOTER_COLORS.length];
                const isMyVote = record.voterId === deviceId;

                return (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${color.bg} ${color.border}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Distinct Voter Dot / Chip */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-sm ${color.badge}`}
                      >
                        #{record.voterNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${color.text}`}>
                            {isMyVote ? 'أنت (تقييم جهازك)' : `مقيّم #${record.voterNumber}`}
                          </span>
                          {isMyVote && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                              جهازك
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          <span>{record.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Colored Score Display & Admin/Voter Delete Action */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg border font-mono ${color.pill}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-black">{record.score}</span>
                        <span className="text-[10px] opacity-70">/ 10</span>
                      </div>

                      {(isAdmin || isMyVote) && onDeleteRatingRecord && (
                        <div className="flex items-center">
                          {deletingRecordId === record.id ? (
                            <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800 px-1.5 py-0.5 rounded-lg animate-in fade-in">
                              <span className="text-[10px] text-rose-200">حذف؟</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteRatingRecord(player.id, record.id);
                                  setDeletingRecordId(null);
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                              >
                                نعم
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingRecordId(null)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors"
                              >
                                لا
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingRecordId(record.id)}
                              className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700/60 hover:border-rose-500/40 transition-colors cursor-pointer"
                              title={isAdmin ? "حذف هذا التقييم (أدمن)" : "حذف تقييمك"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION: Past Anonymous Comments */}
        <div className="border-t border-neutral-800/80 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-bold text-neutral-300">
                تعليقات وملاحظات المباراة ({player.comments.length})
              </h3>
            </div>
            {isAdmin && player.comments.length > 0 && onClearPlayerComments && (
              <div>
                {isConfirmingClearComments ? (
                  <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800 px-2 py-0.5 rounded-lg animate-in fade-in">
                    <span className="text-[10px] text-rose-200">مسح كل التعليقات؟</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearPlayerComments(player.id);
                        setIsConfirmingClearComments(false);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                    >
                      نعم، مسح
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearComments(false)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearComments(true)}
                    className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title="خاص بالأدمن: مسح جميع التعليقات لهذا اللاعب"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>مسح كل التعليقات</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {player.comments.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/50 text-center">
              <p className="text-xs text-neutral-500">
                لا توجد أي تعليقات مسجلة بعد لهذا اللاعب.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pl-1">
              {player.comments.map((cmt) => {
                const color =
                  cmt.colorIndex !== undefined
                    ? VOTER_COLORS[cmt.colorIndex % VOTER_COLORS.length]
                    : null;
                const isMyComment = cmt.voterId === deviceId;

                return (
                  <div
                    key={cmt.id}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-right group relative"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            color ? color.text : 'text-emerald-400'
                          }`}
                        >
                          {isMyComment ? 'أنت (تعليقك)' : 'مجهول'}
                        </span>
                        {isMyComment && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-bold">
                            جهازك
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-mono text-[10px]">
                          {formatTimeAgoArabic(cmt.timestamp)}
                        </span>
                        {(isAdmin || isMyComment) && onDeleteComment && (
                          <div className="flex items-center">
                            {deletingCommentId === cmt.id ? (
                              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-800 px-1.5 py-0.5 rounded-lg animate-in fade-in">
                                <span className="text-[10px] text-rose-200">حذف؟</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteComment(player.id, cmt.id);
                                    setDeletingCommentId(null);
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors"
                                >
                                  نعم
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingCommentId(null)}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors"
                                >
                                  لا
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingCommentId(cmt.id)}
                                className="p-1 rounded bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                                title={isAdmin ? "حذف هذا التعليق (أدمن)" : "حذف تعليقك"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-200 leading-relaxed break-words">
                      {cmt.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Admin Photo Upload Modal */}
      {isPhotoModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl relative text-right">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  صورة اللاعب: {player.name}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  اختر صورة من جهازك أو ضع رابط صورة مباشر
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden flex items-center justify-center">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-neutral-500">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-bold border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>رفع صورة من جهازك (ملف)</span>
              </button>

              <form onSubmit={handleSavePhotoUrl} className="space-y-2 pt-1">
                <label className="block text-[11px] text-neutral-400">
                  أو الصق رابط صورة خارجي مباشر:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    حفظ
                  </button>
                </div>
              </form>

              {player.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full py-2 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  إزالة الصورة والعودة للأحرف
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
