"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { Button } from "./ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";

interface WorkflowNodeProps {
  name?: string;
  description?: string;
  children: React.ReactNode;
  onDelete?: () => void;
  onSettings?: () => void;
  showToolbar?: boolean;
}

export const WorkflowNode = ({
  children,
  name,
  description,
  onDelete,
  onSettings,
  showToolbar = false,
}: WorkflowNodeProps) => {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="size-4" />
          </Button>

          <Button size="sm" variant="ghost" onClick={onSettings}>
            <SettingsIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}

      {children}

      {name && (
        <NodeToolbar
          isVisible
          position={Position.Bottom}
          className="max-w-[200px] text-center truncate"
        >
          <p className=" font-medium">{name}</p>
          {!!description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
};
