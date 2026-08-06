import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { useBikeData } from '../../state/BikeContext';
import { updateConfig } from '../../db';
import { buildWearAlert } from '../../lib/wearNotify';

const notificationSupported = typeof window !== 'undefined' && 'Notification' in window;

export function WearNotifyPrompt() {
  const { activeBike, config } = useBikeData();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    notificationSupported ? Notification.permission : null
  );

  const alert = activeBike ? buildWearAlert(activeBike, activeBike.profile) : null;
  const today = new Date().toISOString().slice(0, 10);

  const fireIfDue = () => {
    if (!alert || config?.wearNotifiedDate === today) return;
    new Notification(alert.title, { body: alert.body });
    updateConfig({ wearNotifiedDate: today }).catch((err) => {
      console.error('recording wearNotifiedDate failed', err);
    });
  };

  useEffect(() => {
    if (permission === 'granted') fireIfDue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission, alert?.body, config?.wearNotifiedDate]);

  if (!notificationSupported || !alert || permission !== 'default') return null;

  const handleEnable = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <button
      onClick={handleEnable}
      className="min-h-[52px] flex items-center gap-3 bg-[rgba(255,107,0,.09)] border border-accent/30 rounded-16 p-3 text-left"
    >
      <div className="w-8 h-8 rounded-10 bg-[rgba(255,107,0,.13)] flex items-center justify-center shrink-0">
        <BellRing size={15} className="text-accent-light" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-[11.5px] text-ink-100">มีอะไหล่ใกล้ถึงกำหนดเปลี่ยน</div>
        <div className="font-sans text-[9.5px] text-ink-400">แตะเพื่อเปิดแจ้งเตือนอัตโนมัติ</div>
      </div>
    </button>
  );
}
