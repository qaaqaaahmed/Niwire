import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useParams } from "next/navigation";

export const ExecuteWorkflow = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const executeWorkflow = useExecuteWorkflow();

  const handleExecuteWorkflow = () => {
    executeWorkflow.mutate({ id: workflowId });
  };
  return (
    <Button
      type="button"
      onClick={handleExecuteWorkflow}
      disabled={executeWorkflow.isPending}
    >
      Execute Workflow
    </Button>
  );
};
