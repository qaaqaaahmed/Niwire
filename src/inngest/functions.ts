// src/inngest/functions.ts
import { inngest } from "./client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogle } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

const openai = createOpenAI();
const google = createGoogle();
const anthropic = createAnthropic({});

export const processTask = inngest.createFunction(
  { id: "extrapolate-ai", triggers: { event: "extrapolate/ai" } },
  async ({ event, step }) => {
    await step.sleep("waiting", "5s");
    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai("gpt-4o"),
        prompt:
          "What would you see in a 24 year old and would earn your respect?",
      },
    );

    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-3.5-flash"),
        prompt:
          "What would you see in a 24 year old and would earn your respect?",
      },
    );

    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-5-5"),
        prompt:
          "What would you see in a 24 year old and would earn your respect?",
      },
    );

    return { openaiSteps, geminiSteps, anthropicSteps };
  },
);
