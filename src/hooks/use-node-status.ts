import { ClientSubscriptionToken, useRealtime } from "inngest/react";
import z from "zod";

type UseNodeStatusProps = {
  channel: string;
  token:
    | ClientSubscriptionToken
    | (() => Promise<string | ClientSubscriptionToken>);
  nodeId: string;
  topic: string;
};

const statusPayloadSchema = z.object({
  status: z.enum(["loading", "success", "error"]),
  nodeId: z.string(),
});
export const useNodeStatus = ({
  channel,
  token,
  nodeId,
  topic,
}: UseNodeStatusProps) => {
  const { messages } = useRealtime({
    channel: channel,
    topics: [topic] as const,
    token: token,
  });

  const status =
    messages.all
      .filter(
        (message) =>
          message.kind === "data" &&
          message.channel === channel &&
          message.topic === topic,
      )
      .map((message) => statusPayloadSchema.safeParse(message.data))
      .filter((result) => result.success && result.data.nodeId === nodeId)
      .at(-1)?.data?.status ?? "initial";

  return status;
};
