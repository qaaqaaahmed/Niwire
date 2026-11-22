import { NodeTypes } from "@xyflow/react";
import { NodeType } from "../../generated/prisma/enums";
import { InitialNode } from "@/components/initial-node";
import { ManualTrigger } from "@/features/triggers/components/manual-trigger/node";
import { HttpRequestNode } from "@/features/executions/http-request/node";
import { GeminiNode } from "@/features/executions/gemini/node";
import { OpenAINode } from "@/features/executions/openAI/node";
import { AnthropicNode } from "@/features/executions/anthropic/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTrigger,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAINode,
  [NodeType.ANTHROPIC]: AnthropicNode,
} as const satisfies NodeTypes;

export type RegistedNodeTypes = keyof typeof nodeComponents;
