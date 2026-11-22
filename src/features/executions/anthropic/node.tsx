import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { AnthropicDialog, FormSchemaType } from "./dialog";
import { useParams } from "next/navigation";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchAnthropicToken } from "./actions";

type AnthropicNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicDataType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicDataType>) => {
  const { setNodes } = useReactFlow();
  const [anthropicDialogOpen, setAnthropicDialogOpen] = useState(false);
  const nodeData = props.data;

  const description = props.data.userPrompt
    ? `claude: ${props.data.userPrompt.slice(0, 50)}...`
    : "Not configured";
  const handleOpenDialog = () => setAnthropicDialogOpen(true);

  const { workflowId } = useParams<{ workflowId: string }>();

  const status = useNodeStatus({
    channel: `anthropic:${workflowId}`,
    topic: "status",
    nodeId: props.id,
    token: () => fetchAnthropicToken({ workflowId }),
  });

  const handleSubmit = (values: FormSchemaType) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };
  return (
    <>
      <AnthropicDialog
        open={anthropicDialogOpen}
        onOpenChange={setAnthropicDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        name="Anthropic"
        description={description}
        icon="/logos/anthropic.svg"
        status={status}
      />
    </>
  );
});
AnthropicNode.displayName = "AnthropicNode";
