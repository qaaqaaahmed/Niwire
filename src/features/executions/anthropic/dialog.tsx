import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  defaultValues: Partial<FormSchemaType>;
  onSubmit: (values: FormSchemaType) => void;
}

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { error: "Variable name is required" })
    .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]+$/, {
      error:
        "Variable name must start with a-z or A-Z or _  or $ and must only contain letter a-z or A-Z or 0-9 or _ or $",
    }),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { error: "user prompt is required" }),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export const AnthropicDialog = ({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleFormSubmit = (values: FormSchemaType) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const watchVariableName = form.watch("variableName") || "myGPT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anthropic Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for Anthropic
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              <FormField
                name="variableName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Variable Name" />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the result in other nodes.{" "}
                      {`{{${watchVariableName}.aiResponse}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="systemPrompt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px] font-mono"
                        {...field}
                        placeholder="You are a helpful assistant"
                      />
                    </FormControl>
                    <FormDescription>
                      Sets the behaviour of the model. Use {"{{ variables }}"}{" "}
                      for simple values or use {"{{json variable}}"} to
                      stringify objects
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="userPrompt"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt (Required)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] font-mono"
                        {...field}
                        placeholder={`Summarize this text: {{json anthropic.aiResponse}}`}
                      />
                    </FormControl>

                    <FormDescription>
                      JSON with template variables. Use {"{{variables}}"} for
                      simple values or {"{{json variables}}"} to stringify
                      objects
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
