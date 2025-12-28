// @ts-nocheck
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"; import { Button, buttonVariants } from "./button"; function Pagination({ , ...props }: React.ComponentProps<"nav">) { return ( <nav role="navigation" label="pagination" data-slot="pagination" {...props} /> );
} function PaginationContent({ , ...props
}: React.ComponentProps<"ul">) { return ( <ul data-slot="pagination-content" {...props} /> );
} function PaginationItem({ ...props }: React.ComponentProps<"li">) { return <li data-slot="pagination-item" {...props} />;
} type PaginationLinkProps = { isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> & React.ComponentProps<"a">; function PaginationLink({ , isActive, size = "icon", ...props
}: PaginationLinkProps) { return ( <a current={isActive ? "page" : undefined} data-slot="pagination-link" data-active={isActive}))} {...props} /> );
} function PaginationPrevious({ , ...props
}: React.ComponentProps<typeof PaginationLink>) { return ( <PaginationLink label="Go to previous page" size="default" {...props} > <ChevronLeftIcon /> <span >Previous</span> </PaginationLink> );
} function PaginationNext({ , ...props
}: React.ComponentProps<typeof PaginationLink>) { return ( <PaginationLink label="Go to next page" size="default" {...props} > <span >Next</span> <ChevronRightIcon /> </PaginationLink> );
} function PaginationEllipsis({ , ...props
}: React.ComponentProps<"span">) { return ( <span hidden data-slot="pagination-ellipsis" {...props} > <MoreHorizontalIcon /> <span >More pages</span> </span> );
} export { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis,
};
