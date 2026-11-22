import { NodeExecutor } from "@/config/types";
import { manualTrigger } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;
export const ManualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  workflowId,
  nodeId,
  context,
  step,
}) => {
  const channel = manualTrigger({ workflowId });

  await step.realtime.publish(
    `manual-trigger-loading-${nodeId}`,
    channel.status,
    {
      status: "loading",
      nodeId,
    },
  );
  const result = await step.run(
    `manual-trigger-${nodeId}`,
    async () => context,
  );

  await step.realtime.publish(
    `manual-trigger-success-${nodeId}`,
    channel.status,
    {
      status: "success",
      nodeId,
    },
  );
  return result;
};
