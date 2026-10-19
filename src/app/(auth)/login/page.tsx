import { LoginForm } from "@/features/auth/components/login-form";
import { requireTobeUnauthenticated } from "@/lib/auth-utils";

const Page = async () => {
  await requireTobeUnauthenticated();
  return <LoginForm />;
};

export default Page;
