import React from 'react';

type Option = { value: number; label: string };

type MetaSelectProps = {
  label: string;
  value: number;
  options: Option[];
  onChange?: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export const MetaSelect: React.FC<MetaSelectProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
}) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }>
      <label className="text-xs text-gray-600">{label}</label>
      <select
        aria-label={ariaLabel ?? label}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
