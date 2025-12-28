// @ts-nocheck
"use client";

import React, { useState } from "react";
import { cn } from "./utils";
import NativePopover from "./native-popover";

type Item = { value: string; label: React.ReactNode };

type NativeSelectProps = {
  value?: string | null;
  onChange?: (value: string) => void;
  items: Item[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
};

export const NativeSelect = ({ value, onChange, items, placeholder = "選択してください", disabled = false, className = "", triggerClassName = "" }: NativeSelectProps) => {
  const [open, setOpen] = useState(false);

  const selected = items.find((it) => it.value === value);

  return (
    <NativePopover
      open={open}
      onOpenChange={(o) => setOpen(o)}
      trigger={(
        <button
          type="button"
          
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span >{selected ? selected.label : placeholder}</span>
          <svg  viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      
    >
      <div role="listbox" aria-activedescendant={selected ? `native-select-${selected.value}` : undefined} tabIndex={-1}>
        <div >
          {items.map((it) => (
            <button
              key={it.value}
              id={`native-select-${it.value}`}
              role="option"
              aria-selected={it.value === value}
              onClick={() => {
                onChange?.(it.value);
                setOpen(false);
              }}
              
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </NativePopover>
  );
};

export default NativeSelect;
