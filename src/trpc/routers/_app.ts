import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  test: protectedProcedure.mutation(async ({}) => {
    await inngest.send({ name: "extrapolate/ai" });
    return { status: "Ok", message: "Request has been queed" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
