import { NodeExecutor } from "@/config/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

import { openAIChannel } from "@/inngest/channels/openai";

type OpenAIExecutorData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (value) => JSON.stringify(value, null, 2));

export const openAIExecutor: NodeExecutor<OpenAIExecutorData> = async ({
  nodeId,
  data,
  context,
  step,
  workflowId,
}) => {
  const channel = openAIChannel({ workflowId });
  await step.realtime.publish(`openai-loading-${nodeId}`, channel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await step.realtime.publish(`openai-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `openAI Node: Variable name is missing in node -> ${nodeId}`,
    );
  }

  if (!data.userPrompt?.trim()) {
    await step.realtime.publish(`openai-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `OpenAI Node: Missing "userPrompt" in node -> ${nodeId}`,
    );
  }
  const userPrompt = Handlebars.compile(data.userPrompt, { noEscape: true })(
    context,
  );

  const systemPrompt = Handlebars.compile(
    data.systemPrompt?.trim() || "You are a helpful assistant",
  )(context);

  const API_KEY = process.env.OPENAI_API_KEY;
  const openai = createOpenAI({ apiKey: API_KEY });

  try {
    //what we need to do is we need to check the userPrompt -> usehandlebars
    //then use the google sdk to send request to gemini and return the response
    const { steps } = await step.ai.wrap(
      `openai-generate-text-${nodeId}`,
      generateText,
      {
        model: openai("gpt-4o"),
        instructions: systemPrompt || "you are a helpful assistant",
        prompt: userPrompt,
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(`openai-success-${nodeId}`, channel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: text,
    };
  } catch (error) {
    await step.realtime.publish(`openai-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw error;
  }
};
