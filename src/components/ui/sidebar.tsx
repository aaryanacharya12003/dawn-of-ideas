
import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Sidebar components
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full border-r shrink-0 bg-sidebar transition-width duration-300",
        className
      )}
      {...props}
    />
  );
}

// Sidebar header component
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("h-16 border-b flex items-center px-4", className)}
      {...props}
    />
  );
}

// Sidebar content component
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn("py-4 px-2 h-[calc(100%-8rem)]", className)}
      {...props}
    />
  );
}

// Sidebar menu component
interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

// Sidebar menu item component
interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return (
    <div
      className={cn("relative", className)}
      {...props}
    />
  );
}

// Sidebar menu button component
const sidebarMenuButtonVariants = cva(
  "group flex items-center gap-4 px-3 py-2 rounded-md cursor-pointer text-muted-foreground transition-colors w-full",
  {
    variants: {
      isActive: {
        true: "bg-primary-foreground text-primary",
        false: "hover:bg-muted/50 hover:text-foreground",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, children, asChild = false, isActive, tooltip, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <button
          className={cn(sidebarMenuButtonVariants({ isActive }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </button>
      );
    }
    
    return (
      <button
        className={cn(sidebarMenuButtonVariants({ isActive }), className)}
        ref={ref}
        aria-label={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SidebarMenuButton.displayName = "SidebarMenuButton";

// Sidebar footer component
interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn("h-16 border-t mt-auto px-2", className)}
      {...props}
    />
  );
}

// Sidebar trigger component
interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "p-2 rounded-md hover:bg-muted/50",
        className
      )}
      ref={ref}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 4h18"></path>
        <path d="M3 12h18"></path>
        <path d="M3 20h18"></path>
      </svg>
    </button>
  );
});

SidebarTrigger.displayName = "SidebarTrigger";

// Sidebar inset component
interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return <div className={cn("flex-1", className)} {...props} />;
}
