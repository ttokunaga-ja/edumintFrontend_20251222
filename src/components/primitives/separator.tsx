// @ts-nocheck
"use client"; import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator"; function Separator({ , orientation = "horizontal", decorative = true, ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) { return ( <SeparatorPrimitive.Root data-slot="separator-root" decorative={decorative} orientation={orientation} {...props} /> );
} export { Separator };
