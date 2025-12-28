// @ts-nocheck
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root>;

function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      
      {...props}
    />
  );
}

export { Label };
