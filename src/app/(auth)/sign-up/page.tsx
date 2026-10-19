import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { requireTobeUnauthenticated } from "@/lib/auth-utils";

const SignUp = async () => {
  await requireTobeUnauthenticated();
  return <SignUpForm />;
};

export default SignUp;
