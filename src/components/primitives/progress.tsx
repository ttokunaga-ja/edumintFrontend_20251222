// @ts-nocheck
"use client"; import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress"; function Progress({ , value, ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) { return ( <ProgressPrimitive.Root data-slot="progress" {...props} > <ProgressPrimitive.Indicator data-slot="progress-indicator" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /> </ProgressPrimitive.Root> );
} export { Progress };
