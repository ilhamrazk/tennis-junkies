import { PlayerStanding } from '../types/tennis';

export function generateLeaderboardPoster(
  eventTitle: string,
  hostName: string,
  standings: PlayerStanding[]
): string {
  const canvasWidth = 720;
  const canvasHeight = 1280;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Background (Dark Gradient)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, '#0C1710');
  bgGradient.addColorStop(0.5, '#122019');
  bgGradient.addColorStop(1, '#07100B');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle decorative tennis court grid line
  ctx.strokeStyle = 'rgba(216, 245, 59, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(50, canvasHeight);
  ctx.moveTo(canvasWidth - 50, 0);
  ctx.lineTo(canvasWidth - 50, canvasHeight);
  ctx.stroke();

  // 2. Header Tag
  ctx.fillStyle = '#D8F53B';
  ctx.font = '900 15px Inter, Arial, sans-serif';
  ctx.fillText('THE JUNKIES CO. • LIVE LEADERBOARD', 55, 75);

  // 3. Main Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px Inter, Arial, sans-serif';
  ctx.fillText('THE JUNKIES GAME', 55, 130);

  // 4. Subtitle / Event Name
  ctx.fillStyle = '#FF7A45';
  ctx.font = '800 24px Inter, Arial, sans-serif';
  const displaySub = eventTitle.length > 40 ? eventTitle.substring(0, 38) + '...' : eventTitle;
  ctx.fillText(displaySub.toUpperCase(), 55, 170);

  // 5. Host & Date Tag
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px Inter, Arial, sans-serif';
  ctx.fillText(`HOST: ${hostName.toUpperCase()}  •  ${dateStr.toUpperCase()}`, 55, 205);

  // Divider Line
  const tableYStart = 240;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(55, tableYStart);
  ctx.lineTo(canvasWidth - 55, tableYStart);
  ctx.stroke();

  // 6. Table Headers
  const colX = { pos: 85, name: 145, played: 435, won: 505, lost: 575, points: 645 };

  ctx.fillStyle = '#94A3B8';
  ctx.font = '800 20px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('POS', colX.pos, tableYStart + 32);
  ctx.textAlign = 'left';
  ctx.fillText('PLAYER NAME', colX.name, tableYStart + 32);
  ctx.textAlign = 'center';
  ctx.fillText('P', colX.played, tableYStart + 32);
  ctx.fillText('W', colX.won, tableYStart + 32);
  ctx.fillText('L', colX.lost, tableYStart + 32);
  ctx.fillText('PTS', colX.points, tableYStart + 32);

  ctx.beginPath();
  ctx.moveTo(55, tableYStart + 48);
  ctx.lineTo(canvasWidth - 55, tableYStart + 48);
  ctx.stroke();

  // 7. Render Standings Rows (Max 14 rows)
  let currentY = tableYStart + 48;
  const rowHeight = 62;
  const maxRender = Math.min(standings.length, 14);

  for (let idx = 0; idx < maxRender; idx++) {
    const p = standings[idx];
    currentY += rowHeight;

    // Row separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(55, currentY + 12);
    ctx.lineTo(canvasWidth - 55, currentY + 12);
    ctx.stroke();

    // Rank colors
    if (idx === 0) {
      ctx.fillStyle = '#D8F53B';
      ctx.font = '900 28px Inter, Arial, sans-serif';
    } else if (idx === 1) {
      ctx.fillStyle = '#F1F5EC';
      ctx.font = '900 28px Inter, Arial, sans-serif';
    } else if (idx === 2) {
      ctx.fillStyle = '#D8F53B';
      ctx.font = '900 28px Inter, Arial, sans-serif';
    } else {
      ctx.fillStyle = '#64748B';
      ctx.font = '800 22px Inter, Arial, sans-serif';
    }

    ctx.textAlign = 'center';
    ctx.fillText(`${idx + 1}`, colX.pos, currentY - 6);

    // Player name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'left';
    const displayName = p.name.length > 17 ? p.name.substring(0, 15) + '..' : p.name;
    ctx.fillText(displayName, colX.name, currentY - 6);

    // Stats
    ctx.font = '700 22px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(p.played.toString(), colX.played, currentY - 6);
    ctx.fillStyle = '#D8F53B';
    ctx.fillText(p.won.toString(), colX.won, currentY - 6);
    ctx.fillStyle = '#FF7A45';
    ctx.fillText(p.lost.toString(), colX.lost, currentY - 6);

    // Points
    ctx.fillStyle = idx < 3 ? '#D8F53B' : '#E2E8F0';
    ctx.font = '900 26px Inter, Arial, sans-serif';
    ctx.fillText(p.points.toString(), colX.points, currentY - 6);
  }

  // 8. Footer
  const footerY = canvasHeight - 48;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#D8F53B';
  ctx.font = '700 18px Inter, Arial, sans-serif';
  ctx.fillText('The Junkies Co. Matchmaking App  •  Official Standing System', 55, footerY);

  return canvas.toDataURL('image/png');
}

export function downloadPosterFile(dataUrl: string, eventTitle: string) {
  const link = document.createElement('a');
  const safeName = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `leaderboard_${safeName}_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

