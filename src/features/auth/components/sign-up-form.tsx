"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const signUpFormSchema = z
  .object({
    name: z.string().min(1, { message: "Please provide a name" }),
    email: z.string().email({ message: "Email is required" }),
    password: z.string().min(5, { message: "Password is required" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
    path: ["confirmPassword"],
  });

type SignUpFormType = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<SignUpFormType>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const disabled = form.formState.isSubmitting;

  const onSubmit = async (values: SignUpFormType) => {
    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: ({ error }) => {
          toast.message(error.message);
        },
      },
    );
  };
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Create your account below to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6 mt-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {}}
                    size="sm"
                    disabled={disabled}
                  >
                    <Image
                      src={`/logos/google.svg`}
                      alt="Google Logo"
                      width={24}
                      height={24}
                    />
                    Get started with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {}}
                    size="sm"
                    disabled={disabled}
                  >
                    <Image
                      src={`/logos/github.svg`}
                      alt="Github Logo"
                      width={24}
                      height={24}
                    />
                    Get started with Github
                  </Button>
                </div>

                <div className="flex flex-col gap-6">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter a name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="name@example.com"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="**********"
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="**********"
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={disabled}>
                    Sign up
                  </Button>
                </div>

                <div className="text-center text-sm ">
                  Already have an account?{" "}
                  <Link
                    href={`/login`}
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
