import React, { useState, useEffect } from 'react';
import { PlayerStanding } from '../types/tennis';
import { generateLeaderboardPoster, downloadPosterFile } from '../utils/imageGenerator';
import { Download } from 'lucide-react';
import { Sheet } from './ui';

interface ShareModalProps {
  eventTitle: string;
  hostName: string;
  standings: PlayerStanding[];
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  eventTitle,
  hostName,
  standings,
  onClose,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    const url = generateLeaderboardPoster(eventTitle, hostName, standings);
    setDataUrl(url);
  }, [eventTitle, hostName, standings]);

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadPosterFile(dataUrl, eventTitle);
  };

  return (
    <Sheet onClose={onClose}>
      <div className="space-y-4 text-center">
        <div>
          <p className="eyebrow mb-1 !text-ball">Format 9:16</p>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Poster Klasemen</h3>
          <p className="mt-1 text-xs font-medium text-chalk/50">Siap dibagikan ke Instagram Story & WhatsApp</p>
        </div>

        <div className="flex max-h-[50vh] justify-center overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
          {dataUrl ? (
            <img src={dataUrl} alt="Pratinjau poster klasemen" className="max-h-[50vh] w-auto object-contain" />
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-chalk/40">
              Membuat poster...
            </div>
          )}
        </div>

        <button onClick={handleDownload} disabled={!dataUrl} className="btn-primary w-full">
          <Download className="h-4 w-4" />
          <span>Unduh poster (PNG)</span>
        </button>
      </div>
    </Sheet>
  );
};
