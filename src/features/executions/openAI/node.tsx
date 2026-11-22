import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { FormSchemaType, OpenAIDialog } from "./dialog";
import { useParams } from "next/navigation";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchOpenAIToken } from "./actions";

type OpenaiNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAiNodeDataType = Node<OpenaiNodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAiNodeDataType>) => {
  const { setNodes } = useReactFlow();
  const [openAIDialogOpen, setOpenAIDialogOpen] = useState(false);
  const nodeData = props.data;

  const description = props.data.userPrompt
    ? `gpt4o: ${props.data.userPrompt.slice(0, 50)}...`
    : "Not configured";
  const handleOpenDialog = () => setOpenAIDialogOpen(true);

  const { workflowId } = useParams<{ workflowId: string }>();

  const status = useNodeStatus({
    channel: `openai:${workflowId}`,
    topic: "status",
    nodeId: props.id,
    token: () => fetchOpenAIToken({ workflowId }),
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
      <OpenAIDialog
        open={openAIDialogOpen}
        onOpenChange={setOpenAIDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        name="OpenAI"
        description={description}
        icon="/logos/openai.svg"
        status={status}
      />
    </>
  );
});
OpenAINode.displayName = "OpenAINode";
