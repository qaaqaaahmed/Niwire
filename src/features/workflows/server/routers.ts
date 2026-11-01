import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { generateSlug } from "random-word-slugs";
import z from "zod";
import { NodeType } from "../../../../generated/prisma/enums";
import type { Edge, Node } from "@xyflow/react";
import { TRPCError } from "@trpc/server";

// stopped here because i made type nullish

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
  updateWorkflow: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        nodes: z.array(
          z.object({
            id: z.string().min(1),
            type: z.nativeEnum(NodeType),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()),
          }),
        ),
        edges: z.array(
          z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { nodes, edges } = input;

      // check if the workflow exists
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }
      // checks if all the ids in the edges actually exist in the nodes sent by the user
      const nodeIds = new Set(nodes.map((node) => node.id));
      const isInvalid = edges.some(
        (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
      );

      if (isInvalid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid edges" });
      }

      // now delete all the nodes for this workflow and edges and create new ones
      await prisma.$transaction(async (tx) => {
        //delete nodes
        await tx.node.deleteMany({
          where: { workflowId: workflow.id },
        });

        // map the nodes to match what the db expects
        const dbNodes = nodes.map((node) => {
          return {
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
            name: node.type,
            workflowId: workflow.id,
          };
        });

        // create the nodes
        await tx.node.createMany({
          data: dbNodes,
        });

        // map the connections to match the db
        const connections = edges.map((edge) => {
          return {
            workflowId: workflow.id,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
            fromNodeId: edge.source,
            toNodeId: edge.target,
          };
        });

        // create many connections
        await tx.connection.createMany({
          data: connections,
        });

        // update the workflow
        await tx.workflow.update({
          where: { id: workflow.id, userId: ctx.auth.user.id },
          data: { updatedAt: new Date() },
        });
      });

      return workflow;
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
