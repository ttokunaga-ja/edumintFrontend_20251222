// @ts-nocheck
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react"; function Breadcrumb({ ...props }: React.ComponentProps<"nav">) { return <nav label="breadcrumb" data-slot="breadcrumb" {...props} />;
} function BreadcrumbList({ , ...props }: React.ComponentProps<"ol">) { return ( <ol data-slot="breadcrumb-list" {...props} /> );
} function BreadcrumbItem({ , ...props }: React.ComponentProps<"li">) { return ( <li data-slot="breadcrumb-item" {...props} /> );
} function BreadcrumbLink({ asChild, ...props
}: React.ComponentProps<"a"> & { asChild?: boolean;
}) { const Comp = asChild ? Slot : "a"; return ( <Comp data-slot="breadcrumb-link" {...props} /> );
} function BreadcrumbPage({ , ...props }: React.ComponentProps<"span">) { return ( <span data-slot="breadcrumb-page" role="link" disabled="true" current="page" {...props} /> );
} function BreadcrumbSeparator({ children, ...props
}: React.ComponentProps<"li">) { return ( <li data-slot="breadcrumb-separator" role="presentation" hidden="true" {...props} > {children ?? <ChevronRight />} </li> );
} function BreadcrumbEllipsis({ , ...props
}: React.ComponentProps<"span">) { return ( <span data-slot="breadcrumb-ellipsis" role="presentation" hidden="true" {...props} > <MoreHorizontal /> <span >More</span> </span> );
} export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis,
};
