// @ts-nocheck
"use client";

import React, { useEffect, useState, useId } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

type NativePopoverProps = {
  trigger: React.ReactElement;
  children: React.ReactNode; // popover content
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
};

export const NativePopover = ({ trigger, children, open, onOpenChange, id, className = "" }: NativePopoverProps) => {
  const uid = useId();
  const popId = id || `native-popover-${uid}`;
  const [supportsNative, setSupportsNative] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const div = document.createElement("div") as any;
      // detect Popover API support by checking for 'popover' property on element
      setSupportsNative("popover" in div);
    } catch (e) {
      setSupportsNative(false);
    }
  }, []);

  if (supportsNative) {
    // attach popovertarget attr to trigger
    const triggerWithAttr = React.cloneElement(trigger, {
      popovertarget: popId,
    } as any);

    return (
      <>
        {triggerWithAttr}
        <div id={popId} popover="auto" className={className} role="dialog">
          {children}
        </div>
      </>
    );
  }

  // Fallback to Radix Popover
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content sideOffset={8} className={className} id={popId}>
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default NativePopover;
