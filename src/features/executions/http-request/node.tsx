import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GlobeIcon } from "lucide-react";
import { FormSchemaType, HttpRequestDialog } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  body?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  [key: string]: unknown;
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
        defaultBody={nodeData.body}
        defaultUrl={nodeData.endpoint}
        defaultMethod={nodeData.method}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        onSettings={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        name="HTTP Request"
        description={description}
        icon={GlobeIcon}
        status="initial"
      />
    </>
  );
});
HttpRequestNode.displayName = "HttpRequestNode";
