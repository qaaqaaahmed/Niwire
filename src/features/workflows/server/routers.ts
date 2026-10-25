import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import { generateSlug } from "random-word-slugs";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.auth.user.id,
      },
    });
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
      // throw new TRPCError({
      //   code: "INTERNAL_SERVER_ERROR",
      //   message: "fuck off",
      // });
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
