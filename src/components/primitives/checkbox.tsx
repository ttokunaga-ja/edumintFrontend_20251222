// @ts-nocheck
"use client"; import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react"; function Checkbox({ , ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) { return ( <CheckboxPrimitive.Root data-slot="checkbox" {...props} > <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" style={{ display: undefined, alignItems: "center", justifyContent: "center" }} > <CheckIcon /> </CheckboxPrimitive.Indicator> </CheckboxPrimitive.Root> );
} export { Checkbox };
