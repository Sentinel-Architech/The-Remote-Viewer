import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "right" | "bottom" }
>(({ className, children, side = "right", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col border border-border bg-card p-5 shadow-lg",
        "max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-auto max-md:max-h-[min(92dvh,40rem)] max-md:w-full max-md:overflow-y-auto max-md:rounded-t-[var(--radius-xl)] max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        side === "right" && "md:inset-y-0 md:right-0 md:h-full md:w-[min(100%,22rem)]",
        side === "bottom" && "inset-x-0 bottom-0 top-auto h-auto max-h-[min(92dvh,40rem)] w-full overflow-y-auto rounded-t-[var(--radius-xl)] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 text-muted-foreground hover:text-fg">
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent, SheetClose };
