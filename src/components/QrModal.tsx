import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Sheet } from './ui';

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
    <Sheet onClose={onClose}>
      <div className="space-y-5 text-center">
        <div>
          <p className="eyebrow mb-1 !text-ball">Scan untuk gabung</p>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">QR Lapangan</h3>
          <p className="mt-1 text-xs font-medium text-chalk/50">{eventTitle}</p>
        </div>

        <div className="mx-auto w-fit rounded-3xl bg-chalk p-4 shadow-ball">
          <QRCodeSVG value={spectatorUrl} size={210} level="M" bgColor="#F1F5EC" fgColor="#07100B" />
        </div>

        <p className="mx-auto max-w-xs text-sm leading-relaxed text-chalk/55">
          Arahkan kamera HP ke QR ini untuk lihat jadwal court dan klasemen secara live.
        </p>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900 p-1.5 pl-4">
          <input
            type="text"
            readOnly
            value={spectatorUrl}
            className="min-w-0 flex-1 truncate bg-transparent font-mono text-xs text-chalk/50 outline-none"
          />
          <button onClick={handleCopy} className="btn-primary shrink-0 !rounded-xl !px-4 !py-2.5 !text-xs">
            {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
};
