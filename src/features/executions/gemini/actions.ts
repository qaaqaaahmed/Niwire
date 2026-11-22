"use server";

import { getClientSubscriptionToken } from "inngest/react";
import { inngest } from "@/inngest/client";
import { requireTobeAuthenticated } from "@/lib/auth-utils";
import prisma from "@/lib/db";

import { geminiChannel } from "@/inngest/channels/gemini";

export async function fetchGeminiToken({ workflowId }: { workflowId: string }) {
  const { user } = await requireTobeAuthenticated();

  const workflow = await prisma.workflow.findUniqueOrThrow({
    where: {
      id: workflowId,
      userId: user.id,
    },
  });

  return getClientSubscriptionToken(inngest, {
    channel: geminiChannel({ workflowId: workflow.id }),
    topics: ["status"],
  });
}
