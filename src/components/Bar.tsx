import { useZeroToTarget } from '../hooks/useZeroToTarget';

type BarProps = {
  pct: number;
  colorClass: string;
};

export function Bar({ pct, colorClass }: BarProps) {
  const currentPct = useZeroToTarget(pct);

  return (
    <div className="h-[7px] w-full bg-app rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(.22,1,.36,1)] ${colorClass.replace('text-', 'bg-')}`}
        style={{ width: `${currentPct}%` }}
      />
    </div>
  );
}
