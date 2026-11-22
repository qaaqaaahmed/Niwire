import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { FormSchemaType, GeminiDialog } from "./dialog";
import { useParams } from "next/navigation";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchGeminiToken } from "./actions";

type GeminiNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeDataType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeDataType>) => {
  const { setNodes } = useReactFlow();
  const [geminiDialogOpen, setGeminiDialogOpen] = useState(false);
  const nodeData = props.data;

  const description = props.data.userPrompt
    ? `Gemini: ${props.data.userPrompt.slice(0, 50)}...`
    : "Not configured";
  const handleOpenDialog = () => setGeminiDialogOpen(true);

  const { workflowId } = useParams<{ workflowId: string }>();

  const status = useNodeStatus({
    channel: `gemini:${workflowId}`,
    topic: "status",
    nodeId: props.id,
    token: () => fetchGeminiToken({ workflowId }),
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
      <GeminiDialog
        open={geminiDialogOpen}
        onOpenChange={setGeminiDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        name="Gemini"
        description={description}
        icon="/logos/gemini.svg"
        status={status}
      />
    </>
  );
});
GeminiNode.displayName = "GeminiNode";
