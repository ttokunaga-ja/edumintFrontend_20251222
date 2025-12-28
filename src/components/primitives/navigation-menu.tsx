// @ts-nocheck
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react"; function NavigationMenu({ , children, viewport = true, ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean;
}) { return ( <NavigationMenuPrimitive.Root data-slot="navigation-menu" data-viewport={viewport} {...props} > {children} {viewport && <NavigationMenuViewport />} </NavigationMenuPrimitive.Root> );
} function NavigationMenuList({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) { return ( <NavigationMenuPrimitive.List data-slot="navigation-menu-list" {...props} /> );
} function NavigationMenuItem({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) { return ( <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" {...props} /> );
} const navigationMenuTriggerStyle = cva(
); function NavigationMenuTrigger({ , children, ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) { return ( <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" {...props} > {children}{" "} <ChevronDownIcon hidden="true" /> </NavigationMenuPrimitive.Trigger> );
} function NavigationMenuContent({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) { return ( <NavigationMenuPrimitive.Content data-slot="navigation-menu-content" {...props} /> );
} function NavigationMenuViewport({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) { return ( <div > <NavigationMenuPrimitive.Viewport data-slot="navigation-menu-viewport" {...props} /> </div> );
} function NavigationMenuLink({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) { return ( <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" {...props} /> );
} function NavigationMenuIndicator({ , ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) { return ( <NavigationMenuPrimitive.Indicator data-slot="navigation-menu-indicator" {...props} > <div /> </NavigationMenuPrimitive.Indicator> );
} export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle,
};
