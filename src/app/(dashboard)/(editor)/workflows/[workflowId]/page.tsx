import { Editor } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchSingleWorkflow } from "@/features/workflows/server/prefetch";
import { requireTobeAuthenticated } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ workflowId: string }>;
}
const Page = async ({ params }: Props) => {
  await requireTobeAuthenticated();
  const { workflowId } = await params;

  prefetchSingleWorkflow({ workflowId });

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<p>ERROR</p>}>
        <Suspense fallback={<p>loading....</p>}>
          <EditorHeader workflowId={workflowId} />
          <Editor workflowId={workflowId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
