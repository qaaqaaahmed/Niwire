import { inngest } from "@/inngest/client";
import { type GetStepTools } from "inngest";
export type ContextType = Record<string, unknown>;

export type StepTools = GetStepTools<typeof inngest>;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  data: TData;
  context: ContextType;
  step: StepTools;
  nodeId: string;
  workflowId: string;
}

export type NodeExecutor<TData = Record<string, unknown>> = (
  params: NodeExecutorParams<TData>,
) => Promise<ContextType>;
