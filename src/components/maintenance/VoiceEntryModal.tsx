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
  oil: 'Engine Oil',
  brake: 'Brake Pads',
  chain: 'Chain',
  tyre: 'Tyres',
  air: 'Air Filter',
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
      showToast('Voice recognition unavailable — enter the details manually');
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
    const cost = parseInt(costInput, 10) || 0;
    if (!odo) {
      showToast('Enter the odometer reading first');
      return;
    }
    await recordService(activeBike.id, { partKey, odo, cost, shop: shopInput });
    onClose();
    showToast(`${PART_LABELS[partKey]} logged by voice · counter reset`);
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
                {phase === 'listening' ? 'LISTENING… พูดได้เลย' : 'VOICE ENTRY'}
              </div>
              <div className="font-sans text-[11px] text-ink-400 text-center min-h-[16px]">
                {phase === 'listening' ? (transcript || 'ฟังอยู่...') : 'Tap the mic and say what you did'}
              </div>
              {phase === 'idle' && (
                <button
                  onClick={startListening}
                  className="w-full min-h-[48px] mt-1 rounded-12 bg-accent2 text-[#000000] font-display font-bold text-[12px] tracking-[.06em] uppercase"
                >
                  START SPEAKING
                </button>
              )}
              {phase === 'idle' && (
                <button
                  onClick={() => setPhase('manual')}
                  className="flex items-center gap-1.5 text-ink-400 font-sans text-[11px] mt-1"
                >
                  <Keyboard size={13} /> type it instead
                </button>
              )}
            </>
          )}

          {(phase === 'parsed' || phase === 'manual') && (
            <div className="w-full flex flex-col gap-3.5">
              <div className="font-display font-bold text-[13px] tracking-[.04em] text-good uppercase text-center">
                {phase === 'parsed' ? 'PARSED' : 'ENTER MANUALLY'}
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
                  <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">Odometer</label>
                  <input
                    type="number"
                    value={odoInput}
                    onChange={(e) => setOdoInput(e.target.value)}
                    className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">Cost (฿)</label>
                  <input
                    type="number"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">Shop</label>
                <input
                  type="text"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  placeholder="Self-serviced at home"
                  className="w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none focus:border-accent2 placeholder:text-ink-500"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full min-h-[48px] rounded-12 bg-good text-[#0F172A] font-display font-bold text-[13px] tracking-[.06em] uppercase"
              >
                SAVE ENTRY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
