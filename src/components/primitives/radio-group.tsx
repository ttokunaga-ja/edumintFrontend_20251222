// @ts-nocheck
"use client"; import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react"; function RadioGroup({ , ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) { return ( <RadioGroupPrimitive.Root data-slot="radio-group" {...props} /> );
} function RadioGroupItem({ , ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) { return ( <RadioGroupPrimitive.Item data-slot= {...props} > <RadioGroupPrimitive.Indicator data-slot= style={{ display: undefined, alignItems: "center", justifyContent: "center" }} > <CircleIcon /> </RadioGroupPrimitive.Indicator> </RadioGroupPrimitive.Item> );
} export { RadioGroup, RadioGroupItem };
