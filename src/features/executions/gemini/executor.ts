import { NodeExecutor } from "@/config/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createGoogle } from "@ai-sdk/google";

import { geminiChannel } from "@/inngest/channels/gemini";

type GeminiExecutorData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (value) => JSON.stringify(value, null, 2));

export const geminiExecutor: NodeExecutor<GeminiExecutorData> = async ({
  nodeId,
  data,
  context,
  step,
  workflowId,
}) => {
  const channel = geminiChannel({ workflowId });
  await step.realtime.publish(`gemini-loading-${nodeId}`, channel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await step.realtime.publish(`gemini-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `Gemini Node: Variable name is missing in node -> ${nodeId}`,
    );
  }

  if (!data.userPrompt?.trim()) {
    await step.realtime.publish(`gemini-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `Gemini Node: Missing "userPrompt" in node -> ${nodeId}`,
    );
  }
  const userPrompt = Handlebars.compile(data.userPrompt, { noEscape: true })(
    context,
  );

  const systemPrompt = Handlebars.compile(
    data.systemPrompt?.trim() || "You are a helpful assistant",
  )(context);

  const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogle({ apiKey: API_KEY });

  try {
    //what we need to do is we need to check the userPrompt -> usehandlebars
    //then use the google sdk to send request to gemini and return the response
    const { steps } = await step.ai.wrap(
      `gemini-generate-text-${nodeId}`,
      generateText,
      {
        model: google("gemini-3.8-flash"),
        instructions: systemPrompt || "you are a helpful assistant",
        prompt: userPrompt,
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(`gemini-success-${nodeId}`, channel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: text,
    };
  } catch (error) {
    await step.realtime.publish(`gemini-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw error;
  }
};
