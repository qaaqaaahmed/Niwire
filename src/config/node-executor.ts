import { ManualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { NodeType } from "../../generated/prisma/enums";
import { NodeExecutor } from "./types";
import { httpExecutor } from "@/features/executions/http-request/executor";
import { geminiExecutor } from "@/features/executions/gemini/executor";
import { openAIExecutor } from "@/features/executions/openAI/executor";
import { anthropicExecutor } from "@/features/executions/anthropic/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: ManualTriggerExecutor,
  [NodeType.INITIAL]: ManualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openAIExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
};

export const getExecutor = (type: NodeType) => {
  const executor = executorRegistry[type];

  if (!executor) {
    throw new Error(`Could not find executor for type: ${type}`);
  }
  return executor;
};
