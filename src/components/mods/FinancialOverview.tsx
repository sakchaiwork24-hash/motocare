import { useMemo } from 'react';
import { useBikes } from '../../state/BikeContext';
import { useZeroToTarget } from '../../hooks/useZeroToTarget';

export function FinancialOverview() {
  const { activeBike } = useBikes();

  const { spent, ordered, wish, installedCount, wishlistCount } = useMemo(() => {
    let s = 0, o = 0, w = 0, ic = 0, wc = 0;
    (activeBike?.mods ?? []).forEach(m => {
      if (m.stage === 'installed') { s += m.price; ic++; }
      else if (m.stage === 'ordered') { o += m.price; }
      else if (m.stage === 'wishlist') { w += m.price; wc++; }
    });
    return { spent: s, ordered: o, wish: w, total: Math.max(1, s + o + w), installedCount: ic, wishlistCount: wc };
  }, [activeBike]);

  const spentPct = useZeroToTarget((spent / Math.max(1, spent + ordered + wish)) * 100);
  const orderedPct = useZeroToTarget((ordered / Math.max(1, spent + ordered + wish)) * 100);
  const wishPct = useZeroToTarget((wish / Math.max(1, spent + ordered + wish)) * 100);

  if (!activeBike) return null;

  return (
    <div className="bg-surface rounded-16 p-4 border border-border animate-mcFade">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-ink-500 text-[11px] tracking-wider uppercase mb-1">ใช้ไปแล้ว</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl text-ink-100 tabular-nums">{spent.toLocaleString()}</span>
            <span className="font-display font-semibold text-xs text-accent">THB</span>
          </div>
          <p className="font-sans text-xs text-ink-500 mt-0.5">ติดตั้งแล้ว {installedCount} ชิ้นบน {activeBike.nick}</p>
        </div>
        <div className="text-right">
          <h3 className="font-display text-ink-500 text-[11px] tracking-wider uppercase mb-1">อยากได้</h3>
          <span className="font-display text-2xl text-ink-100 tabular-nums">฿{wish.toLocaleString()}</span>
          <p className="font-sans text-xs text-ink-500 mt-0.5">ค้างอยู่ {wishlistCount} รายการ</p>
        </div>
      </div>

      <div className="h-[9px] rounded-full overflow-hidden flex bg-sunken mb-3">
        <div className="h-full transition-all" style={{ width: `${spentPct.toFixed(1)}%`, backgroundColor: '#FF6B00' }} />
        <div className="h-full transition-all" style={{ width: `${orderedPct.toFixed(1)}%`, backgroundColor: '#F59E0B' }} />
        <div className="h-full transition-all" style={{ width: `${wishPct.toFixed(1)}%`, backgroundColor: '#06B6D4' }} />
      </div>

      <div className="flex justify-between text-xs font-sans text-ink-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF6B00' }} />
          ติดตั้งแล้ว
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
          สั่งแล้ว ฿{ordered.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
          อยากได้
        </div>
      </div>
    </div>
  );
}
