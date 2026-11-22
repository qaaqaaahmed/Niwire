"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { requireTobeAuthenticated } from "@/lib/auth-utils";
import prisma from "@/lib/db";

import { anthropicChannel } from "@/inngest/channels/anthropic";

export async function fetchAnthropicToken({
  workflowId,
}: {
  workflowId: string;
}) {
  const { user } = await requireTobeAuthenticated();

  const workflow = await prisma.workflow.findUniqueOrThrow({
    where: {
      id: workflowId,
      userId: user.id,
    },
  });

  return getClientSubscriptionToken(inngest, {
    channel: anthropicChannel({ workflowId: workflow.id }),
    topics: ["status"],
  });
}
