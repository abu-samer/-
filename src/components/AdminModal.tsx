import { useState, type FormEvent } from 'react';
import { ADMIN_PASSWORD } from '../utils/helpers';
import { Shield, ShieldCheck, Lock, X, LogOut, KeyRound, CalendarCheck, CalendarX } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  simulateVotingOpen?: boolean | null;
  onToggleSimulate?: () => void;
  onClose: () => void;
  onSuccess: () => void;
  onLogout: () => void;
}

export default function AdminModal({
  isOpen,
  isAdmin,
  simulateVotingOpen,
  onToggleSimulate,
  onClose,
  onSuccess,
  onLogout,
}: AdminModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl relative text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isAdmin
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isAdmin ? 'وضع المسؤول مفعل' : 'صلاحيات المسؤول'}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isAdmin
                ? 'لديك كامل الصلاحيات لتعديل وإضافة وحذف اللاعبين'
                : 'أدخل كلمة المرور للتحكم باللاعبين (الأسماء، الإضافة، الحذف)'}
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>أنت الآن في وضع المسؤول. يمكنك تغيير الأسماء وإضافة أو حذف أي لاعب.</span>
            </div>

            {/* Admin-only Wednesday simulation toggle */}
            {onToggleSimulate && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">فتح التصويت (محاكاة الأربعاء)</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {simulateVotingOpen !== null
                      ? 'وضع المحاكاة مفعّل الآن للتجربة'
                      : 'التصويت يتبع التوقيت الفعلي (الأربعاء فقط)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleSimulate}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    simulateVotingOpen !== null
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  {simulateVotingOpen !== null ? (
                    <>
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>مفتوح (محاكاة)</span>
                    </>
                  ) : (
                    <>
                      <CalendarX className="w-3.5 h-3.5" />
                      <span>تفعيل المحاكاة</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>إغلاق وضع المسؤول (قفل)</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  placeholder="أدخل كلمة المرور..."
                  className={`w-full bg-neutral-950 border rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                    error
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500'
                      : 'border-neutral-800 focus:border-emerald-500'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute top-3 right-3 pointer-events-none" />
              </div>
              {error && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">
                  كلمة المرور غير صحيحة، حاول مجدداً.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تأكيد الدخول</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
