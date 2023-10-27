import { Session } from "@e2b/sdk";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SerpAPI } from "langchain/tools";
import {
  addCommentTool,
  exec,
  ghGraphQL,
  labelIssueTool,
  updateInstructions,
} from "../tools";
import { env } from "~/env.mjs";
import { isDev } from "lib/utils";
import { Label } from "lib/types";

const model = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: env.OPENAI_API_KEY,
  temperature: 0.5,
});

export default async function engineer({
  input,
  octokit,
  prisma,
  customerId,
  owner,
  allLabels,
}: {
  input: string;
  octokit: any;
  prisma: any;
  customerId: string;
  owner: string;
  allLabels: Label[];
}) {
  const shell = await Session.create({
    apiKey: env.E2B_API_KEY,
    id: "Nodejs",
    onStderr: (data) => console.error(data.line),
    onStdout: (data) => console.log(data.line),
  });

  const tools = [
    new SerpAPI(),
    labelIssueTool({ octokit, allLabels }),
    addCommentTool({ octokit }),
    updateInstructions({ octokit, prisma, customerId, owner }),
    ghGraphQL({ octokit }),
    exec({
      description: "Executes a shell command.",
      name: "shell",
      shell,
    }),
    exec({
      description:
        'Executes a shell command with git logged in. Commands must begin with "git ".',
      name: "git",
      preCmdCallback: (cmd: string) => {
        const tokenB64 = btoa(`pat:${env.GITHUB_ACCESS_TOKEN}`);
        const authFlag = `-c http.extraHeader="AUTHORIZATION: basic ${tokenB64}"`;

        // Replace only first occurrence to avoid prompt injection
        // Otherwise "git log && echo 'git '" would print the token
        const cmdWithAuth = cmd.replace("git ", `git ${authFlag} `);
        return cmdWithAuth;
      },
      setupCmd: `git config --global user.email "${env.GITHUB_EMAIL}" && git config --global user.name "${env.GITHUB_USERNAME}"`,
      shell,
    }),
  ];

  const prefix = `You are a senior AI engineer.
You use the internet, shell, and git to solve problems.
You like to read the docs.
Only use necessary tools.
Always check your work before claiming something works.
`.replaceAll("\n", " ");

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
    returnIntermediateSteps: isDev,
    handleParsingErrors: true,
    verbose: isDev,
    agentArgs: {
      prefix,
    },
  });

  const result = await executor.call({ input });
  const { output } = result;

  await shell.close();

  return output;
}
