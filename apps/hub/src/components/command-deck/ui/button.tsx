import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,box-shadow,transform,opacity,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] select-none focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-ring)] disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-border)] hover:opacity-90",
        ghost:
          "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:bg-card-2 hover:shadow-[var(--shadow-border-hover)]",
        solid:
          "bg-card-2 text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        selected:
          "bg-primary text-primary-foreground shadow-[var(--shadow-border)]",
      },
      size: {
        toolbar: "h-11 min-w-11 px-3 text-sm",
        icon: "size-11",
        sm: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "toolbar",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
