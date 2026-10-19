import { requireTobeAuthenticated } from "@/lib/auth-utils";

const Page = async () => {
  await requireTobeAuthenticated();
  return <div>Executions</div>;
};

export default Page;
