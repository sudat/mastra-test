import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { githubAnalysisAgent } from "./agents/github-analysis-agent";

export const mastra = new Mastra({
  agents: {
    githubAnalysisAgent,
  },
  logger: new PinoLogger({
    name: "GitHub Analysis Agent",
    level: "info",
  }),
});
