import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Delete, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl space-y-5 relative border-2 border-slate-200 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-brand-orange shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">Verifikasi PIN Host</h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Masukkan 4 digit PIN host untuk mengakses kontrol admin sesi.
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 py-1">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 animate-bounce'
                    : isFilled
                      ? 'bg-brand-orange scale-125 shadow-brand'
                      : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>PIN salah! Coba lagi. (Default: 1234)</span>
          </p>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handlePressDigit(digit)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-orange-50 border-2 border-slate-200 hover:border-orange-200 font-mono text-xl font-black text-slate-900 transition active:scale-95 shadow-xs"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handlePressDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-orange-50 border-2 border-slate-200 hover:border-orange-200 font-mono text-xl font-black text-slate-900 transition active:scale-95 shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Hapus digit"
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-600 transition active:scale-95 shadow-xs"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button onClick={onClose} className="w-full btn-secondary py-2.5 text-xs font-bold">
          Batal
        </button>
      </div>
    </div>
  );
};
