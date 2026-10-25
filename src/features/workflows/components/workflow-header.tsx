"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const WorkflowHeader = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createWorkflow = useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: () => {
        toast.success("workflow created");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Workflows</h2>
          <p className="text-sm">Create and manage workflows</p>
        </div>

        <Button onClick={() => createWorkflow.mutate()}>Create workflow</Button>
      </div>
    </div>
  );
};
