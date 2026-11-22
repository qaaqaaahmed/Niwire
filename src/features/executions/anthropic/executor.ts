import { NodeExecutor } from "@/config/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

import { anthropicChannel } from "@/inngest/channels/anthropic";

type AnthropicExecutorData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

Handlebars.registerHelper("json", (value) => JSON.stringify(value, null, 2));

export const anthropicExecutor: NodeExecutor<AnthropicExecutorData> = async ({
  nodeId,
  data,
  context,
  step,
  workflowId,
}) => {
  const channel = anthropicChannel({ workflowId });
  await step.realtime.publish(`anthropic-loading-${nodeId}`, channel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await step.realtime.publish(`anthropic-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `Anthropic Node: Variable name is missing in node -> ${nodeId}`,
    );
  }

  if (!data.userPrompt?.trim()) {
    await step.realtime.publish(`anthropic-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `Anthropic Node: Missing "userPrompt" in node -> ${nodeId}`,
    );
  }
  const userPrompt = Handlebars.compile(data.userPrompt.trim(), {
    noEscape: true,
  })(context);

  const systemPrompt = Handlebars.compile(
    data.systemPrompt?.trim() || "You are a helpful assistant",
  )(context);

  const API_KEY = process.env.ANTHROPIC_KEY;

  if (!API_KEY) {
    await step.realtime.publish(`anthropic:${workflowId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError(
      `Anthropic Node: Missing "API_KEY" in node -> ${nodeId}`,
    );
  }
  const anthropic = createAnthropic({ apiKey: API_KEY });

  try {
    //what we need to do is we need to check the userPrompt -> usehandlebars
    //then use the google sdk to send request to gemini and return the response
    const { steps } = await step.ai.wrap(
      `anthropic-generate-text-${nodeId}`,
      generateText,
      {
        model: anthropic("claude-opus-4-5"),
        instructions: systemPrompt || "you are a helpful assistant",
        prompt: userPrompt,
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(`anthropic-success-${nodeId}`, channel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: text,
    };
  } catch (error) {
    await step.realtime.publish(`anthropic-error-${nodeId}`, channel.status, {
      nodeId,
      status: "error",
    });
    throw error;
  }
};
