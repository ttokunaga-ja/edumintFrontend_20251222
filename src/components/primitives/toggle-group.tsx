// @ts-nocheck
"use client"; import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority"; import { toggleVariants } from "./toggle"; const ToggleGroupContext = React.createContext< VariantProps<typeof toggleVariants>
>({ size: "default", variant: "default",
}); function ToggleGroup({ , variant, size, children, ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) { return ( <ToggleGroupPrimitive.Root data-slot="toggle-group" data-variant={variant} data-size={size} {...props} > <ToggleGroupContext.Provider value={{ variant, size }}> {children} </ToggleGroupContext.Provider> </ToggleGroupPrimitive.Root> );
} function ToggleGroupItem({ , children, variant, size, ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) { const context = React.useContext(ToggleGroupContext); return ( <ToggleGroupPrimitive.Item data-slot= data-variant={context.variant || variant} data-size={context.size || size}))} {...props} > {children} </ToggleGroupPrimitive.Item> );
} export { ToggleGroup, ToggleGroupItem };
