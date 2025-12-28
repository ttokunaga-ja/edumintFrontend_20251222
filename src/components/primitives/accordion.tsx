// @ts-nocheck
"use client"; import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react"; function Accordion({ ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) { return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
} function AccordionItem({ , ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) { return ( <AccordionPrimitive.Item data-slot="accordion-item" {...props} /> );
} function AccordionTrigger({ , children, ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) { return ( <AccordionPrimitive.Header style={{ display: }> <AccordionPrimitive.Trigger data-slot="accordion-trigger" {...props} > {children} <ChevronDownIcon /> </AccordionPrimitive.Trigger> </AccordionPrimitive.Header> );
} function AccordionContent({ , children, ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) { return ( <AccordionPrimitive.Content data-slot="accordion-content" {...props} > <div >{children}</div> </AccordionPrimitive.Content> );
} export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
