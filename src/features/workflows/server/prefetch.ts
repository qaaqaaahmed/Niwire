import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflows.getMany>;
export const prefetchWorkflows = (input: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(input));
};

type SingleWorkflowInput = inferInput<typeof trpc.workflows.getOne>;

export const prefetchSingleWorkflow = (input: SingleWorkflowInput) => {
  return prefetch(trpc.workflows.getOne.queryOptions(input));
};
