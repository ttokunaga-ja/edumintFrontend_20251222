// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";

type NativeDialogProps = {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
};

export const NativeDialog = ({ isOpen = false, onClose, children, className = "", id }: NativeDialogProps) => {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose?.();
    };

    dialog.addEventListener("cancel", handleCancel as EventListener);

    return () => {
      dialog.removeEventListener("cancel", handleCancel as EventListener);
    };
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (isOpen) {
      try {
        if (!dialog.open) dialog.showModal();
      } catch (err) {
        // Some browsers may not support <dialog>, fall back to append
        if (!dialog.open) (dialog as any).show();
      }
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      id={id}
      ref={ref}
      className={className}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.();
      }}
      onClose={() => {
        // `<dialog>`'s close event fires after close(); ensure React state reflects it
        onClose?.();
      }}
    >
      {children}
    </dialog>
  );
};

export default NativeDialog;
