import { useState } from 'react';
import { useBikes } from '../../state/BikeContext';
import { Mic, ScanLine } from 'lucide-react';
import { VoiceEntryModal } from './VoiceEntryModal';

export function ActionRow() {
  const { openLogFuelSheet } = useBikes();
  const [voiceOpen, setVoiceOpen] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => setVoiceOpen(true)}
        className="min-h-[56px] rounded-16 bg-[rgba(6,182,212,.11)] border border-[rgba(6,182,212,.34)] p-2.5 flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-[rgba(6,182,212,.2)] flex items-center justify-center">
          <Mic size={16} className="text-[#22D3EE]" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-[#22D3EE] uppercase">
            VOICE ENTRY
          </div>
          <div className="font-sans text-[9px] text-[#22D3EE] opacity-80 truncate">
            พูดแทนพิมพ์ · TH/EN
          </div>
        </div>
      </button>

      <button
        onClick={openLogFuelSheet}
        className="min-h-[56px] rounded-16 bg-surface border border-border p-2.5 flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-sunken border border-border flex items-center justify-center">
          <ScanLine size={16} className="text-ink-200" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-display font-semibold text-[10px] tracking-[.06em] text-ink-200 uppercase">
            SCAN RECEIPT
          </div>
          <div className="font-sans text-[9px] text-ink-400 truncate">
            OCR · อ่านใบเสร็จ
          </div>
        </div>
      </button>

      <VoiceEntryModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}