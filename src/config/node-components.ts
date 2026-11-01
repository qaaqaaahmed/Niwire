import { NodeTypes } from "@xyflow/react";
import { NodeType } from "../../generated/prisma/enums";
import { InitialNode } from "@/components/initial-node";
import { ManualTrigger } from "@/features/triggers/components/manual-trigger/node";
import { HttpRequestNode } from "@/features/executions/http-request/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTrigger,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const satisfies NodeTypes;

export type RegistedNodeTypes = keyof typeof nodeComponents;
