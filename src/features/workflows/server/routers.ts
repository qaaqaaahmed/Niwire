import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { generateSlug } from "random-word-slugs";
import z from "zod";
import { NodeType } from "../../../../generated/prisma/enums";
import type { Edge, Node } from "@xyflow/react";

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL,
          },
        },
      },
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
        include: { nodes: true, connections: true },
      });

      const nodes: Node[] = workflow.nodes.map((node) => {
        return {
          id: node.id,
          name: node.name,
          type: node.type,
          position: node.position as { x: number; y: number },
          data: node.data as Record<string, unknown>,
        };
      });

      const edges: Edge[] = workflow.connections.map((connection) => {
        return {
          id: connection.id,
          source: connection.fromNodeId,
          target: connection.toNodeId,
          sourceHandle: connection.fromOutput,
          targetHandle: connection.toInput,
        };
      });
      return {
        workflow,
        nodes,
        edges,
        name: workflow.name,
        // id: workflow.id, hmmmm do i really need this
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z
          .number()
          .int()
          .min(PAGINATION.MIN_PAGE)
          .max(PAGINATION.MAX_PAGE)
          .default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .int()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // await new Promise((resolve) => setTimeout(resolve, 20000));

      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.workflow.findMany({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          take: pageSize,
          skip: (page - 1) * pageSize,
          orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        }),

        prisma.workflow.count({
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const hasPreviousPage = page > 1;
      const hasNextPage = totalPages > page;
      return {
        items,
        totalCount,
        totalPages,
        hasPreviousPage,
        hasNextPage,
        page,
        pageSize,
        search,
      };
    }),

  updateWorkflowName: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        name: z.string().trim().min(1, {
          message: "The name of your workflow must have at least a character",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedWorkflow = await prisma.workflow.update({
        where: {
          id: input.workflowId,
          userId: ctx.auth.user.id,
        },
        data: { name: input.name },
      });
      return updatedWorkflow;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      return prisma.workflow.delete({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });
    }),
});
