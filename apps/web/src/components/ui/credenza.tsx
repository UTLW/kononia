"use client";

import * as React from "react";
import { Dialog as CredenzaPrimitive } from "@base-ui/react/dialog";
import { cn } from "@kononia/ui/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BaseProps {
  children: React.ReactNode;
}

interface RootCredenzaProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CredenzaProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const CredenzaContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const useCredenzaContext = () => {
  const context = React.useContext(CredenzaContext);
  if (!context) {
    throw new Error("Credenza components cannot be rendered outside Credenza context");
  }
  return context;
};

function Credenza({ children, open, onOpenChange, ...props }: RootCredenzaProps) {
  const isMobile = useIsMobile();

  return (
    <CredenzaContext.Provider value={{ isMobile }}>
      <CredenzaPrimitive open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </CredenzaPrimitive>
    </CredenzaContext.Provider>
  );
}

function CredenzaTrigger({ className, children, ...props }: CredenzaProps & { render?: React.ReactNode }) {
  return (
    <CredenzaPrimitive.Trigger className={className} {...props}>
      {children}
    </CredenzaPrimitive.Trigger>
  );
}

function CredenzaContent({ className, children, ...props }: CredenzaProps) {
  const { isMobile } = useCredenzaContext();

  return (
    <CredenzaPrimitive.Portal>
      <CredenzaPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <CredenzaPrimitive.Popup
        data-slot="credenza-content"
        className={cn(
          "fixed z-50 bg-popover text-popover-foreground shadow-2xl rounded-xl border data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95",
          "inset-0 m-auto h-fit my-auto data-ending-style:translate-y-4 data-starting-style:translate-y-4 transition-all duration-200",
          "max-h-[85vh] overflow-y-auto",
          isMobile ? "mobile:inset-x-4 mobile:bottom-4 mobile:w-auto mobile:max-w-full" : "desktop:inset-0 desktop:m-auto desktop:h-fit desktop:w-auto desktop:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
      </CredenzaPrimitive.Popup>
    </CredenzaPrimitive.Portal>
  );
}

function CredenzaHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="credenza-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CredenzaTitle({ className, children, ...props }: CredenzaPrimitive.Title.Props) {
  return (
    <CredenzaPrimitive.Title
      data-slot="credenza-title"
      className={cn("text-xl font-serif font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </CredenzaPrimitive.Title>
  );
}

function CredenzaDescription({ className, children, ...props }: CredenzaPrimitive.Description.Props) {
  return (
    <CredenzaPrimitive.Description
      data-slot="credenza-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </CredenzaPrimitive.Description>
  );
}

function CredenzaBody({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="credenza-body"
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CredenzaFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="credenza-footer"
      className={cn("flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CredenzaClose({ className, children, ...props }: CredenzaProps) {
  return (
    <CredenzaPrimitive.Close className={className} {...props}>
      {children}
    </CredenzaPrimitive.Close>
  );
}

export {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
};