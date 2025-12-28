// @ts-nocheck
"use client"; import * as React from "react";
import * as ContextMenuPrimitive from ;
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"; function ContextMenu({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) { return <ContextMenuPrimitive.Root data-slot= {...props} />;
} function ContextMenuTrigger({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) { return ( <ContextMenuPrimitive.Trigger data-slot= {...props} /> );
} function ContextMenuGroup({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) { return ( <ContextMenuPrimitive.Group data-slot= {...props} /> );
} function ContextMenuPortal({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) { return ( <ContextMenuPrimitive.Portal data-slot= {...props} /> );
} function ContextMenuSub({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) { return <ContextMenuPrimitive.Sub data-slot= {...props} />;
} function ContextMenuRadioGroup({ ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) { return ( <ContextMenuPrimitive.RadioGroup data-slot= {...props} /> );
} function ContextMenuSubTrigger({ , inset, children, ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean;
}) { return ( <ContextMenuPrimitive.SubTrigger data-slot= data-inset={inset} {...props} > {children} <ChevronRightIcon /> </ContextMenuPrimitive.SubTrigger> );
} function ContextMenuSubContent({ , ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) { return ( <ContextMenuPrimitive.SubContent data-slot= {...props} /> );
} function ContextMenuContent({ , ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) { return ( <ContextMenuPrimitive.Portal> <ContextMenuPrimitive.Content data-slot= {...props} /> </ContextMenuPrimitive.Portal> );
} function ContextMenuItem({ , inset, variant = "default", ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive";
}) { return ( <ContextMenuPrimitive.Item data-slot= data-inset={inset} data-variant={variant} {...props} /> );
} function ContextMenuCheckboxItem({ , children, checked, ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) { return ( <ContextMenuPrimitive.CheckboxItem data-slot= checked={checked} {...props} > <span style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <ContextMenuPrimitive.ItemIndicator> <CheckIcon /> </ContextMenuPrimitive.ItemIndicator> </span> {children} </ContextMenuPrimitive.CheckboxItem> );
} function ContextMenuRadioItem({ , children, ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) { return ( <ContextMenuPrimitive.RadioItem data-slot= {...props} > <span style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <ContextMenuPrimitive.ItemIndicator> <CircleIcon /> </ContextMenuPrimitive.ItemIndicator> </span> {children} </ContextMenuPrimitive.RadioItem> );
} function ContextMenuLabel({ , inset, ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean;
}) { return ( <ContextMenuPrimitive.Label data-slot= data-inset={inset} {...props} /> );
} function ContextMenuSeparator({ , ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) { return ( <ContextMenuPrimitive.Separator data-slot= {...props} /> );
} function ContextMenuShortcut({ , ...props
}: React.ComponentProps<"span">) { return ( <span data-slot= {...props} /> );
} export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup,
};
