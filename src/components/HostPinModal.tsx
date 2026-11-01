import React, { useState } from 'react';
import { Sheet } from './ui';
import { ShieldCheck, Lock, AlertCircle, Delete } from 'lucide-react';

interface HostPinModalProps {
  expectedPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const HostPinModal: React.FC<HostPinModalProps> = ({
  expectedPin,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePressDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(false);

      if (next.length === 4) {
        // Evaluate
        if (next === expectedPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <Sheet onClose={onClose}>
      <div className="space-y-6 text-center">
        {/* Icon & Title */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-ball-soft text-ball shadow-ball">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div>
          <h3 className="font-display text-2xl font-black text-chalk">Verifikasi PIN Host</h3>
          <p className="mt-1 text-xs font-semibold text-chalk/50">
            Aksi ini membutuhkan otorisasi Host untuk menghindari salah input oleh penonton.
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'border border-clay bg-clay animate-bounce'
                    : isFilled
                      ? 'bg-ball scale-125 shadow-ball'
                      : 'bg-white/15'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-clay animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <span>PIN salah! Coba lagi. (Default: 1234)</span>
          </p>
        )}

        {/* Tactile Keypad */}
        <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handlePressDigit(digit)}
              className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-display text-2xl font-extrabold text-chalk transition hover:bg-white/10 active:scale-90"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handlePressDigit('0')}
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-display text-2xl font-extrabold text-chalk transition hover:bg-white/10 active:scale-90"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Hapus digit"
            className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-chalk/70 transition hover:bg-white/10 active:scale-90"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>

        <div className="pt-2">
          <button onClick={onClose} className="btn-ghost w-full !py-3 text-xs font-bold">
            Batal
          </button>
        </div>
      </div>
    </Sheet>
  );
};
