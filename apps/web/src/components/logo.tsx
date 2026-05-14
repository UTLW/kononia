"use client";

import Image from "next/image";
import { cn } from "@kononia/ui/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative rounded-lg overflow-hidden", sizeClasses[size])}>
        <Image
          src="/app-icon.png"
          alt="ⲔⲞⲚⲞⲚⲒⲀ"
          fill
          className="object-cover"
          sizes={size === "sm" ? "24px" : size === "md" ? "32px" : size === "lg" ? "40px" : "48px"}
        />
      </div>
      {showText && (
        <span className={cn(
          "font-serif text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-lg",
          size === "lg" && "text-xl",
          size === "xl" && "text-2xl"
        )}>
          ⲔⲞⲚⲞⲚⲒⲀ
        </span>
      )}
    </div>
  );
}