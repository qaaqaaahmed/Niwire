import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GlobeIcon } from "lucide-react";
import { FormSchemaType, HttpRequestDialog } from "./dialog";
import { useParams } from "next/navigation";
import { useNodeStatus } from "@/hooks/use-node-status";
import { fetchHttpRequestToken } from "./actions";

type HttpRequestNodeData = {
  endpoint?: string;
  body?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  variableName?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const { setNodes } = useReactFlow();
  const [httpRequestDialogOpen, setHttpRequestDialogOpen] = useState(false);
  const nodeData = props.data;

  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not Configured";
  const handleOpenDialog = () => setHttpRequestDialogOpen(true);

  const { workflowId } = useParams<{ workflowId: string }>();

  const status = useNodeStatus({
    channel: `http-request:${workflowId}`,
    topic: "status",
    nodeId: props.id,
    token: () => fetchHttpRequestToken({ workflowId }),
  });

  const handleSubmit = (values: FormSchemaType) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              body: values.body,
              endpoint: values.endpoint,
              method: values.method,
              variableName: values.variableName,
            },
          };
        }
        return node;
      }),
    );
  };
  return (
    <>
      <HttpRequestDialog
        open={httpRequestDialogOpen}
        onOpenChange={setHttpRequestDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        name="HTTP Request"
        description={description}
        icon={GlobeIcon}
        status={status}
      />
    </>
  );
});
HttpRequestNode.displayName = "HttpRequestNode";
