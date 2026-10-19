"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="p-4 flex items-center justify-between">
      <Button>Click me</Button>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push(`/login`);
              },
            },
          })
        }
      >
        Logout
      </Button>
    </div>
  );
}
