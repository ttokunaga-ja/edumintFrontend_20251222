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
          className={cn(
            "border-input flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 pr-8 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className={cn("truncate", !selected ? "text-muted-foreground" : "")}>{selected ? selected.label : placeholder}</span>
          <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      className={cn("bg-white text-popover-foreground rounded-md border p-1 shadow-md w-72", className)}
    >
      <div role="listbox" aria-activedescendant={selected ? `native-select-${selected.value}` : undefined} tabIndex={-1}>
        <div className="p-1">
          {items.map((it) => (
            <button
              key={it.value}
              id={`native-select-${it.value}`}
              role="option"
              aria-selected={it.value === value}
              onClick={() => {
                onChange?.(it.value);
                setOpen(false);
              }
              className={cn(
                "w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-gray-100",
                it.value === value && "bg-indigo-50"
              )}
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
