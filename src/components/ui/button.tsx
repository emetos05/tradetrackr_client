import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 rounded font-medium transition-colors",
          variant === "primary"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
