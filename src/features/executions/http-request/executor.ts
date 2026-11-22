import { NodeExecutor } from "@/config/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequest } from "@/inngest/channels/http-request";

type httpExecutorData = {
  variableName?: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  endpoint?: string;
  body?: string;
};

Handlebars.registerHelper("json", (context) =>
  JSON.stringify(context, null, 2),
);
export const httpExecutor: NodeExecutor<httpExecutorData> = async ({
  nodeId,
  data,
  context,
  step,
  workflowId,
}) => {
  const channel = httpRequest({ workflowId });
  await step.realtime.publish(
    `http-request-loading-${nodeId}`,
    channel.status,
    {
      nodeId,
      status: "loading",
    },
  );
  const method = data.method;
  const variableName = data.variableName;

  if (!variableName) {
    await step.realtime.publish(
      `http-request-error-${nodeId}`,
      channel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw new NonRetriableError(
      `HTTP Request Node: Variable name is missing in node -> ${nodeId}`,
    );
  }

  if (!method) {
    await step.realtime.publish(
      `http-request-error-${nodeId}`,
      channel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw new NonRetriableError(
      `Http Request Node: Missing "method" in node -> ${nodeId}`,
    );
  }

  if (!data.endpoint) {
    throw new NonRetriableError(
      `Http Request Node: Missing endpoint in node -> ${nodeId}`,
    );
  }

  // i think we need to make a http request, so for that we need to know the method and make sure we use the right options,
  // we need to check if the body is a valid json
  // we then need to make the request

  try {
    const result = await step.run(`http-request-${nodeId}`, async () => {
      const endpoint = Handlebars.compile(data.endpoint, { noEscape: true })(
        context,
      );

      const options: KyOptions = { method, retry: 0 };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const body = Handlebars.compile(data.body || "{}", { noEscape: true })(
          context,
        );
        try {
          JSON.parse(body);
        } catch {
          throw new NonRetriableError(
            `Http Request Node: Body failed to be parsed to Json`,
          );
        }
        options.body = body;
        options.headers = { "Content-Type": "application/json" };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");

      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };
      return {
        ...context,
        [variableName]: responsePayload,
      };
    });
    await step.realtime.publish(
      `http-request-success-${nodeId}`,
      channel.status,
      {
        nodeId,
        status: "success",
      },
    );
    return result;
  } catch (error) {
    await step.realtime.publish(
      `http-request-error-${nodeId}`,
      channel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
