"use client";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowParams } from "./use-workflow-params";

// hook to create a workflow
export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} created`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
};

// hook to get all the workflows

export const useSuspenseWorkflows = () => {
  const [params] = useWorkflowParams();
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

// hook to remove a workflow

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data.name} deleted`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
      },
    }),
  );
};
