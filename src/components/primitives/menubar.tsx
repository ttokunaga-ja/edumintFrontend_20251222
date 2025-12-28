// @ts-nocheck
"use client"; import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"; function Menubar({ , ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) { return ( <MenubarPrimitive.Root data-slot="menubar" {...props} /> );
} function MenubarMenu({ ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) { return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
} function MenubarGroup({ ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) { return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
} function MenubarPortal({ ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) { return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
} function MenubarRadioGroup({ ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) { return ( <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} /> );
} function MenubarTrigger({ , ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) { return ( <MenubarPrimitive.Trigger data-slot="menubar-trigger" {...props} /> );
} function MenubarContent({ , align = "start", alignOffset = -4, sideOffset = 8, ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) { return ( <MenubarPortal> <MenubarPrimitive.Content data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} {...props} /> </MenubarPortal> );
} function MenubarItem({ , inset, variant = "default", ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive";
}) { return ( <MenubarPrimitive.Item data-slot="menubar-item" data-inset={inset} data-variant={variant} {...props} /> );
} function MenubarCheckboxItem({ , children, checked, ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) { return ( <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" checked={checked} {...props} > <span style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <MenubarPrimitive.ItemIndicator> <CheckIcon /> </MenubarPrimitive.ItemIndicator> </span> {children} </MenubarPrimitive.CheckboxItem> );
} function MenubarRadioItem({ , children, ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) { return ( <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" {...props} > <span style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <MenubarPrimitive.ItemIndicator> <CircleIcon /> </MenubarPrimitive.ItemIndicator> </span> {children} </MenubarPrimitive.RadioItem> );
} function MenubarLabel({ , inset, ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean;
}) { return ( <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset} {...props} /> );
} function MenubarSeparator({ , ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) { return ( <MenubarPrimitive.Separator data-slot="menubar-separator" {...props} /> );
} function MenubarShortcut({ , ...props
}: React.ComponentProps<"span">) { return ( <span data-slot="menubar-shortcut" {...props} /> );
} function MenubarSub({ ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) { return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
} function MenubarSubTrigger({ , inset, children, ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean;
}) { return ( <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" data-inset={inset} {...props} > {children} <ChevronRightIcon /> </MenubarPrimitive.SubTrigger> );
} function MenubarSubContent({ , ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) { return ( <MenubarPrimitive.SubContent data-slot="menubar-sub-content" {...props} /> );
} export { Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent,
};
