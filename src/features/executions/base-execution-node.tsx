import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeProps, Position } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

interface BaseExecutionNodeProps extends NodeProps {
  id: string;
  name: string;
  description?: string;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  status?: NodeStatus;
  icon: LucideIcon | string;
}

export const BaseExecutionNode = ({
  id,
  name,
  description,
  onDoubleClick,
  onSettings,
  status = "initial",
  icon: Icon,
}: BaseExecutionNodeProps) => {
  return (
    <WorkflowNode
      name={name}
      description={description}
      onSettings={onSettings}
      showToolbar
    >
      <NodeStatusIndicator status={status}>
        <BaseNode onDoubleClick={onDoubleClick} status={status}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}

            <BaseHandle id="source-1" type="source" position={Position.Right} />
            <BaseHandle id="target-1" type="target" position={Position.Left} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};
