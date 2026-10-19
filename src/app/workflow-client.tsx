"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const WorkflowClient = () => {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const testAi = useMutation(
    trpc.test.mutationOptions({
      onSuccess: (data) => {
        toast.message(data.message);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleClick = () => {
    testAi.mutate();
  };
  return <Button onClick={handleClick}>Test ai</Button>;
};
