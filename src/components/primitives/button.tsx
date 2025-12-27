// Direct MUI Button PoC
import * as React from "react";
import MuiButton from "@mui/material/Button";

// Direct replacement PoC: map existing variant/size semantics to MUI Button props.
type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type Size = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ComponentProps<typeof MuiButton> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean; // kept for compatibility but ignored in PoC
}

const mapVariant = (v: Variant | undefined) => {
  switch (v) {
    case "destructive":
      return { variant: "contained", color: "error" as any };
    case "outline":
      return { variant: "outlined", color: "inherit" as any };
    case "secondary":
      return { variant: "contained", color: "secondary" as any };
    case "ghost":
      return { variant: "text", color: "inherit" as any };
    case "link":
      return { variant: "text", color: "primary" as any };
    default:
      return { variant: "contained", color: "primary" as any };
  }
};

const mapSize = (s: Size | undefined) => {
  switch (s) {
    case "sm":
      return "small";
    case "lg":
      return "large";
    case "icon":
      return "small";
    default:
      return "medium";
  }
};

function Button({ variant = "default", size = "default", className, ...props }: ButtonProps) {
  const mui = mapVariant(variant);
  const muiSize = mapSize(size);

  return <MuiButton variant={mui.variant} color={mui.color} size={muiSize} className={className} {...props} />;
}

export { Button };
