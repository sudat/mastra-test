import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const googleEnbeddingModel =
  google.textEmbeddingModel("text-embedding-004");

const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

const openRouterDeepSeekR1ThinkingModel = "deepseek/deepseek-r1-0528:free";
export const openRouter = openai(openRouterDeepSeekR1ThinkingModel);
