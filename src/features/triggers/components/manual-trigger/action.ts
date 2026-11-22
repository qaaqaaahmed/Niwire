"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { manualTrigger } from "@/inngest/channels/manual-trigger";
import { requireTobeAuthenticated } from "@/lib/auth-utils";
import prisma from "@/lib/db";

export async function fetchManualTriggerToken({
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
    channel: manualTrigger({ workflowId: workflow.id }),
    topics: ["status"],
  });
}
