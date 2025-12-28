// @ts-nocheck
"use client"; import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar"; function Avatar({ , ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) { return ( <AvatarPrimitive.Root data-slot="avatar" {...props} /> );
} function AvatarImage({ , ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) { return ( <AvatarPrimitive.Image data-slot="avatar-image" {...props} /> );
} function AvatarFallback({ , ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) { return ( <AvatarPrimitive.Fallback data-slot="avatar-fallback" {...props} /> );
} export { Avatar, AvatarImage, AvatarFallback };
