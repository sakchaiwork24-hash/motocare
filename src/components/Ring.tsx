import { useZeroToTarget } from '../hooks/useZeroToTarget';

type RingProps = {
  pct: number;
  colorClass: string;
  radius?: number;
  strokeWidth?: number;
  size?: number;
  children?: React.ReactNode;
};

export function Ring({ pct, colorClass, radius = 23, strokeWidth = 6, size = 56, children }: RingProps) {
  const currentPct = useZeroToTarget(pct);

  const circumference = 2 * Math.PI * radius;
  const dash = (currentPct / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-app"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={`transition-[stroke-dasharray] duration-1000 ease-[cubic-bezier(.22,1,.36,1)] ${colorClass.replace('text-', 'stroke-')}`}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        {children}
      </div>
    </div>
  );
}
