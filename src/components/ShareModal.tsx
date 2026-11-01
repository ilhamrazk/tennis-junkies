import React, { useState, useEffect } from 'react';
import { PlayerStanding } from '../types/tennis';
import { generateLeaderboardPoster, downloadPosterFile } from '../utils/imageGenerator';
import { X, Download, Share2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-center shadow-2xl space-y-4 relative border-2 border-slate-200 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-brand-orange" />
            <span>Poster Klasemen</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Format 9:16 Siap Share ke Instagram Story &amp; WhatsApp</p>
        </div>

        {/* Poster Image Preview */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 max-h-[55vh] flex justify-center bg-slate-900">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Leaderboard Preview"
              className="object-contain max-h-[55vh] w-auto rounded-xl"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Generating Poster...
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={!dataUrl}
          className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 shadow-brand"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD POSTER (PNG)</span>
        </button>
      </div>
    </div>
  );
};
