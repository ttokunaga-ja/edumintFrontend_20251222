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

export const MetaSelect: React.FC<MetaSelectProps> = ({ label, value, options, onChange, disabled = false, ariaLabel }) => {
  return (
    <div style={{ alignItems: 'center', gap: '0.75rem' }}>
      <label>{label}</label>
      <select label={ariaLabel ?? label} value={value} disabled={disabled} onChange={(e) => onChange?.(Number(e.target.value))}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
