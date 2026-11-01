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

interface BaseTriggerNodeProps extends NodeProps {
  id: string;
  onDoubleClick: () => void;
  onSettings: () => void;
  name: string;
  description?: string;
  icon: LucideIcon | string;
  status: NodeStatus;
  //   chidren?: React.ReactNode;
}
export const BaseTriggerNode = ({
  id,
  onDoubleClick,
  onSettings,
  name,
  icon: Icon,
  status,
  description,
}: BaseTriggerNodeProps) => {
  return (
    <WorkflowNode
      showToolbar
      name={name}
      description={description}
      onSettings={onSettings}
    >
      <NodeStatusIndicator
        status={status}
        variant="border"
        className="rounded-l-2xl"
      >
        <BaseNode
          className="rounded-l-2xl"
          onDoubleClick={onDoubleClick}
          status={status}
        >
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}
          </BaseNodeContent>
          <BaseHandle id="source-1" type="source" position={Position.Right} />
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
};
