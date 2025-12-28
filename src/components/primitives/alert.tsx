// @ts-nocheck
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority"; const alertVariants = cva( { variants: { variant: { default: undefined, destructive: undefined, }, }, defaultVariants: { variant: "default", }, }); function Alert({ , variant, ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) { return ( <div data-slot="alert" role="alert"))} {...props} /> );
} function AlertTitle({ , ...props }: React.ComponentProps<"div">) { return ( <div data-slot="alert-title" {...props} /> );
} function AlertDescription({ , ...props
}: React.ComponentProps<"div">) { return ( <div data-slot="alert-description" {...props} /> );
} export { Alert, AlertTitle, AlertDescription };
