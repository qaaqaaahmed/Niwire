interface Props {
  params: Promise<{ workflowId: string }>;
}
const Page = async ({ params }: Props) => {
  const { workflowId } = await params;
  return <div>WorkflowId: {workflowId} </div>;
};

export default Page;
