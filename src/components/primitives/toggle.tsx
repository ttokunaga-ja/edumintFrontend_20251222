// @ts-nocheck
"use client"; import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority"; const toggleVariants = cva( { variants: { variant: { default: undefined, outline: undefined, }, size: { default: undefined, , lg: undefined, }, }, defaultVariants: { variant: "default", size: "default", }, }); function Toggle({ , variant, size, ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) { return ( <TogglePrimitive.Root data-slot="toggle"))} {...props} /> );
} export { Toggle, toggleVariants };
