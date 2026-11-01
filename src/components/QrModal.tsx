import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode } from 'lucide-react';

interface QrModalProps {
  sessionId: string;
  eventTitle: string;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ sessionId, eventTitle, onClose }) => {
  const [copied, setCopied] = useState(false);
  const spectatorUrl = `${window.location.origin}${window.location.pathname}?mode=spectator&session=${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(spectatorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-5 relative border-2 border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-brand-orange mb-3 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">QR Code Lapangan</h3>
          <p className="text-xs text-slate-500 font-bold mt-1 max-w-xs">{eventTitle}</p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 mx-auto">
          <QRCodeSVG
            value={spectatorUrl}
            size={200}
            level="M"
            includeMargin={true}
            bgColor="#F8FAFC"
            fgColor="#0F172A"
          />
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Arahkan kamera smartphone ke QR Code ini untuk melihat jadwal court dan klasemen live secara real-time.
        </p>

        {/* Copy link bar */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 text-left">
          <input
            type="text"
            readOnly
            value={spectatorUrl}
            className="bg-transparent text-xs text-slate-600 flex-1 truncate font-mono outline-none px-2"
          />
          <button
            onClick={handleCopy}
            className="btn-primary py-2 px-4 text-xs font-black shrink-0 flex items-center gap-1 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
