import { realtime } from "inngest";
import { z } from "zod";

export const httpRequest = realtime.channel({
  name: ({ workflowId }: { workflowId: string }) =>
    "http-request:" + workflowId,
  topics: {
    status: {
      schema: z.object({
        nodeId: z.string(),
        status: z.enum(["loading", "success", "error"]),
      }),
    },
  },
});
