"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "outline" | "solid" | "electric" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  outline:  "btn-outline",
  solid:    "btn-solid",
  electric: "btn-electric",
  ghost:    "btn-ghost",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", ...props }, ref) => (
    <button ref={ref} className={cn(variantClass[variant], className)} {...props} />
  ),
);
Button.displayName = "Button";
