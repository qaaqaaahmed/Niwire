import type { ComponentProps } from "react";
import { Handle, type HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type BaseHandleProps = HandleProps;

export function BaseHandle({
  className,
  children,
  ...props
}: ComponentProps<typeof Handle>) {
  return (
    <Handle
      {...props}
      className={cn(
        "dark:border-secondary h-[12px] w-[12px] rounded-full border border-slate-300 bg-background transition",
        className,
      )}
    >
      {children}
    </Handle>
  );
}
