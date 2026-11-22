import { realtime } from "inngest";
import { z } from "zod";

export const manualTrigger = realtime.channel({
  name: ({ workflowId }: { workflowId: string }) =>
    "manual-trigger:" + workflowId,
  topics: {
    status: {
      schema: z.object({
        status: z.enum(["loading", "success", "error"]),
        nodeId: z.string(),
      }),
    },
  },
});
