import { WorkflowClient } from "@/app/workflow-client";
import { requireTobeAuthenticated } from "@/lib/auth-utils";

const Page = async () => {
  await requireTobeAuthenticated();
  return <WorkflowClient />;
};

export default Page;
