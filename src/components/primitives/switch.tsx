// @ts-nocheck
"use client"; import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch"; function Switch({ , ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) { return ( <SwitchPrimitive.Root data-slot="switch" {...props} > <SwitchPrimitive.Thumb data-slot= /> </SwitchPrimitive.Root> );
} export { Switch };
