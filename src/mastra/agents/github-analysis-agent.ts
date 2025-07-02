import { Agent } from "@mastra/core/agent";
import { google } from "../models";
import { cloneRepositoryTool } from "../tools/github/cloneRepository";

export const githubAnalysisAgent = new Agent({
  name: "GitHub Analysis Agent",
  instructions:
    "GitHubリポジトリを解析するエージェントです。リポジトリのURLを指定すると、それをクローンして解析できます。",
  model: google("gemini-2.5-pro"),
  tools: { cloneRepositoryTool },
});
