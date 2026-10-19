import { requireTobeAuthenticated } from "@/lib/auth-utils";

const Page = async () => {
  await requireTobeAuthenticated();
  return <div>Credentials</div>;
};

export default Page;
