import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none border text-[15px] font-medium cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: solid ink.
        default: "border-ink bg-ink text-paper hover:bg-body hover:border-body",
        hero: "border-ink bg-ink text-paper hover:bg-body hover:border-body",
        // Secondary: ink outline on paper.
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        destructive: "border-red bg-red text-paper hover:bg-ink hover:border-ink",
        ghost: "border-transparent text-ink underline-offset-4 hover:underline",
        link: "border-transparent px-0 text-ink underline underline-offset-4 hover:text-body",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2.5 text-sm",
        lg: "px-7 py-3.5",
        xl: "px-8 py-4 text-base",
        icon: "w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
