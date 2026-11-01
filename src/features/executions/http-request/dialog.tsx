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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  defaultMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  defaultUrl?: string;
  defaultBody?: string;
  onSubmit: (values: FormSchemaType) => void;
}

const formSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"], {
    error: "Please choose one of the acceptable method",
  }),
  endpoint: z.url({ error: "Please provide a valid url" }),
  body: z.string().optional(),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export const HttpRequestDialog = ({
  open,
  onOpenChange,
  defaultBody = "",
  defaultMethod = "GET",
  defaultUrl = "",
  onSubmit,
}: Props) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      body: defaultBody,
      method: defaultMethod,
      endpoint: defaultUrl,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        body: defaultBody,
        endpoint: defaultUrl,
        method: defaultMethod,
      });
    }
  }, [open, defaultBody, defaultMethod, defaultUrl, form]);

  const handleFormSubmit = (values: FormSchemaType) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const watchMethod = form.watch("method");
  const showBody = ["POST", "PUT", "PATCH"].includes(watchMethod);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Request Settings</DialogTitle>
          <DialogDescription>
            Configure settings for HTTP request node
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              <FormField
                name="method"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose method" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The HTTP method to use for this request
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="endpoint"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint Url</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://api.example.com/{{httpResponse.data.id}}"
                      />
                    </FormControl>
                    <FormDescription>
                      Status URL or use {"{{ variables }}"} for simple values or
                      use {"{{json variable}}"} to stringify objects
                    </FormDescription>
                  </FormItem>
                )}
              />

              {showBody && (
                <FormField
                  name="body"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px font-mono"
                          {...field}
                          placeholder={
                            '{  \n "userId": "{{httpResponse.data.id}}", \n "name": "{{httpResponse.data.name}}", \n "items": "{{httpResponse.data.items}}"\n }'
                          }
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
              )}

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
