import { useId } from 'react';

type FormFieldProps = {
  label: string;
  labelEn?: string;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url' | 'none';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  step?: string;
  className?: string;
  accent?: 'accent' | 'accent2';
  error?: string;
};

export function FormField({
  label,
  labelEn,
  type = 'text',
  inputMode,
  value,
  onChange,
  onBlur,
  placeholder,
  step,
  className = '',
  accent = 'accent',
  error,
}: FormFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
        {label}
        {labelEn && <span className="opacity-70"> · {labelEn}</span>}
      </label>
      <input
        id={inputId}
        type={type}
        inputMode={inputMode}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-sunken border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none placeholder:text-ink-400 ${
          error ? 'border-urgent' : `border-border ${accent === 'accent2' ? 'focus:border-accent2' : 'focus:border-accent'}`
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="font-sans text-[12px] text-urgent">
          {error}
        </p>
      )}
    </div>
  );
}
