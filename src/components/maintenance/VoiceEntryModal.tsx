import { useEffect, useRef, useState } from 'react';
import { Mic, Keyboard } from 'lucide-react';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { recordService } from '../../db';
import { parseVoiceEntry } from '../../lib/voiceParse';
import type { PartKey } from '../../types';

type VoiceEntryModalProps = {
  open: boolean;
  onClose: () => void;
};

type Phase = 'idle' | 'listening' | 'parsed' | 'manual';

const PART_LABELS: Record<PartKey, string> = {
  oil: 'น้ำมันเครื่อง',
  brake: 'ผ้าเบรก',
  chain: 'โซ่',
  tyre: 'ยาง',
  air: 'ไส้กรองอากาศ',
};

// TypeScript's bundled DOM lib doesn't declare the Web Speech API as a reachable global
// (still non-standard/experimental) — declare just the slice this component uses.
interface MinimalSpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

// Web Speech API isn't in every browser's standard global — feature-detect both the
// standard name and the vendor-prefixed one (Chrome/Android) rather than assuming either exists.
function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function VoiceEntryModal({ open, onClose }: VoiceEntryModalProps) {
  const { activeBike } = useBikes();
  const { showToast } = useToast();
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  const speechSupported = typeof window !== 'undefined' && !!getSpeechRecognitionCtor();
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [partKey, setPartKey] = useState<PartKey>('oil');
  const [odoInput, setOdoInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [shopInput, setShopInput] = useState('');

  useEffect(() => {
    if (!open) return;
    setPhase(speechSupported ? 'idle' : 'manual');
    setTranscript('');
    setOdoInput(activeBike ? activeBike.odo.toString() : '');
    setCostInput('');
    setShopInput('');
    setPartKey('oil');
  }, [open, activeBike, speechSupported]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!open || !activeBike) return null;

  const applyParsedResult = (text: string) => {
    const parsed = parseVoiceEntry(text);
    if (parsed.partKey) setPartKey(parsed.partKey);
    if (parsed.odo) setOdoInput(parsed.odo.toString());
    if (parsed.cost) setCostInput(parsed.cost.toString());
    setPhase('parsed');
  };

  const startListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setPhase('manual');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'th-TH';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalText = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      setTranscript(finalText + interim);
    };
    recognition.onerror = () => {
      showToast('ใช้เสียงไม่ได้ — กรอกรายละเอียดเองแทน');
      setPhase('manual');
    };
    recognition.onend = () => {
      if (finalText.trim()) applyParsedResult(finalText);
      else setPhase('idle');
    };

    recognitionRef.current = recognition;
    setPhase('listening');
    setTranscript('');
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleSave = async () => {
    const odo = parseInt(odoInput, 10);
    const cost = costInput ? parseInt(costInput, 10) : 0;

    if (isNaN(odo)) {
      showToast('กรุณากรอกเลขไมล์ให้ถูกต้อง');
      return;
    }
    if (odo < activeBike.odo) {
      showToast(`เลขไมล์ต้องไม่น้อยกว่า ${activeBike.odo.toLocaleString()} กม.`);
      return;
    }
    if (isNaN(cost) || cost < 0) {
      showToast('ค่าใช้จ่ายต้องไม่ติดลบ');
      return;
    }

    try {
      await recordService(activeBike.id, { partKey, odo, cost, shop: shopInput });
    } catch (err) {
      console.error('recordService failed', err);
      showToast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      return;
    }
    onClose();
    showToast(`บันทึก ${PART_LABELS[partKey]} ด้วยเสียงแล้ว · counter reset`);
  };

  return (
    <div
      className="absolute inset-0 z-[70] bg-[rgba(2,6,15,.8)] flex items-center justify-center p-5 animate-mcFade"
      onClick={onClose}
    >
      <div
        className="relative w-full bg-surface border border-border rounded-24 p-4.5 animate-mcIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3">
          {(phase === 'idle' || phase === 'listening') && (
            <>
              <div className="relative w-[78px] h-[78px] flex items-center justify-center">
                {phase === 'listening' && (
                  <div className="absolute inset-0 rounded-full border-2 border-accent2 animate-mcHalo" />
                )}
                <button
                  onClick={phase === 'listening' ? stopListening : startListening}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                    phase === 'listening' ? 'bg-accent2 animate-mcPulse' : 'bg-[rgba(6,182,212,.15)] border border-accent2/40'
                  }`}
                >
                  <Mic size={26} className={phase === 'listening' ? 'text-ice-surface' : 'text-accent2-light'} />
                </button>
              </div>
              <div className="font-display font-bold text-[13px] tracking-[.04em] text-ink-100 uppercase">
                {phase === 'listening' ? 'กำลังฟัง… พูดได้เลย' : 'บันทึกด้วยเสียง'}
              </div>
              <div className="font-sans text-[11px] text-ink-400 text-center min-h-[16px]">
                {phase === 'listening' ? (transcript || 'ฟังอยู่...') : 'แตะไมค์แล้วพูดว่าทำอะไรไป'}
              </div>
              {phase === 'idle' && (
                <button
                  onClick={startListening}
                  className="w-full min-h-[48px] mt-1 rounded-12 bg-accent2 text-[#000000] font-display font-bold text-[12px] tracking-[.06em] uppercase"
                >
                  เริ่มพูด
                </button>
              )}
              {phase === 'idle' && (
                <button
                  onClick={() => setPhase('manual')}
                  className="flex items-center gap-1.5 text-ink-400 font-sans text-[11px] mt-1"
                >
                  <Keyboard size={13} /> พิมพ์แทน
                </button>
              )}
            </>
          )}

          {(phase === 'parsed' || phase === 'manual') && (
            <div className="w-full flex flex-col gap-3.5">
              <div className="font-display font-bold text-[13px] tracking-[.04em] text-good uppercase text-center">
                {phase === 'parsed' ? 'แปลงข้อความแล้ว' : 'กรอกเอง'}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(Object.keys(PART_LABELS) as PartKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setPartKey(key)}
                    className={`whitespace-nowrap px-3 min-h-[36px] rounded-full font-display font-semibold text-[11px] uppercase border ${
                      partKey === key
                        ? 'bg-[rgba(6,182,212,.15)] border-accent2 text-accent2-light'
                        : 'bg-sunken border-border text-ink-400'
                    }`}
                  >
                    {PART_LABELS[key]}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">เลขไมล์</label>
                  <input
                    type="number"
                    value={odoInput}
                    onChange={(e) => setOdoInput(e.target.value)}
                    className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">ค่าใช้จ่าย (฿)</label>
                  <input
                    type="number"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">ร้าน</label>
                <input
                  type="text"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  placeholder="ทำเองที่บ้าน"
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2 placeholder:text-ink-500"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full min-h-[48px] rounded-12 bg-good text-[#0F172A] font-display font-bold text-[13px] tracking-[.06em] uppercase"
              >
                บันทึก · SAVE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
