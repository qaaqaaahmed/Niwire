import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/hooks/use-node-status";
import { useParams } from "next/navigation";
import { fetchManualTriggerToken } from "./action";

export const ManualTrigger = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { workflowId } = useParams<{ workflowId: string }>();

  const handleOpenDialog = () => setDialogOpen(true);

  const status = useNodeStatus({
    channel: `manual-trigger:${workflowId}`,
    topic: "status",
    nodeId: props.id,
    token: () => fetchManualTriggerToken({ workflowId }),
  });
  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        id={props.id}
        icon={MousePointerIcon}
        name="When clicking 'Execute Workflow'"
        status={status}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
      />
    </>
  );
});

ManualTrigger.displayName = "ManualTrigger";
