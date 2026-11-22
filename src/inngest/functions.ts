// src/inngest/functions.ts
import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/config/node-executor";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", triggers: { event: "workflows/execute.workflow" } },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError(`WorkflowId Missing`);
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      // lets return sorted nodes to be executed before we start looping over them
      const workflow = await prisma.workflow.findUnique({
        where: {
          id: workflowId,
        },
        include: { nodes: true, connections: true },
      });

      if (!workflow) {
        throw new NonRetriableError(
          `Could not find the workflow for some reason`,
        );
      }

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    let context = event.data.initial || {};

    for (const node of sortedNodes) {
      // we need to find the executor call it with the node, step, context and workflowId,nodeId
      const executor = getExecutor(node.type);
      context = await executor({
        nodeId: node.id,
        step: step,
        context: context,
        data: node.data as Record<string, unknown>,
        workflowId,
      });
    }

    return {
      workflowId,
      result: context,
    };
  },
);
// npx --ignore-scripts=false inngest-cli@latest dev
