type FormFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  step?: string;
  className?: string;
  accent?: 'accent' | 'accent2';
};

export function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  step,
  className = '',
  accent = 'accent',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="font-display font-medium text-[10px] text-ink-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-sunken border border-border rounded-12 px-3 min-h-[44px] font-sans text-[15px] text-ink-100 outline-none placeholder:text-ink-500 ${
          accent === 'accent2' ? 'focus:border-accent2' : 'focus:border-accent'
        }`}
      />
    </div>
  );
}
