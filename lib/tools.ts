import { Session } from "@e2b/sdk";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import { addComment, labelIssue } from "./utils/github";
import { Label } from "./types";

/**
 * Execute a shell command
 */
export function exec({
  shell,
  setupCmd = "",
  preCmdCallback = (cmd) => cmd,
  name,
  description,
}: {
  shell: Session;
  setupCmd?: string;
  preCmdCallback?: (cmd: string) => string;
  name: string;
  description: string;
}) {
  return new DynamicStructuredTool({
    description,
    func: async ({ cmd }) => {
      if (setupCmd) {
        const setup = await shell.process.start({
          cmd: setupCmd,
        });

        await setup.wait();
      }

      const modifiedCmd = preCmdCallback(cmd);

      const proc = await shell.process.start({ cmd: modifiedCmd });

      await proc.wait();

      return JSON.stringify(proc.output);
    },
    name,
    schema: z.object({
      cmd: z.string().describe("The shell command to execute"),
    }),
  });
}

/**
 * Call GitHub GQL API
 */
export function ghGraphQL({ octokit }: { octokit: any }) {
  return new DynamicStructuredTool({
    description: "GitHub GraphQL API",
    func: async ({ command }) => {
      try {
        const res = await octokit.graphql(command);

        return JSON.stringify(res);
      } catch (error: any) {
        return `Something went wrong: ${error.message || "unknown error"}`;
      }
    },
    name: "octokit",
    schema: z.object({
      command: z
        .string()
        .describe(
          "Query or mutation for the GitHub GraphQL API. Wrap it in backticks."
        ),
    }),
  });
}

/**
 * Comment on an issue
 */
export function addCommentTool({ octokit }: { octokit: any }) {
  return new DynamicStructuredTool({
    description: "Adds a comment to an issue",
    func: async ({ issueId, comment }) => {
      const res = await addComment({ octokit, issueId, comment });

      return JSON.stringify(res);
    },
    name: "addComment",
    schema: z.object({
      issueId: z.string().describe("The ID of the issue"),
      comment: z.string().describe("The comment to add"),
    }),
  });
}

/**
 * Label an issue
 */
export function labelIssueTool({
  octokit,
  allLabels,
}: {
  octokit: any;
  allLabels: Label[];
}) {
  return new DynamicStructuredTool({
    description: "Adds a label to an issue",
    name: "labelIssue",
    schema: z.object({
      issueId: z.string().describe("The ID of the issue"),
      labelNames: z.array(z.string()).describe("The names of labels to apply"),
    }),
    func: async ({ issueId, labelNames }) => {
      const res = await labelIssue({ octokit, labelNames, allLabels, issueId });

      return JSON.stringify(res);
    },
  });
}

/**
 * Update custom instructions
 */
export function updateInstructions({
  prisma,
  customerId,
  owner,
  octokit,
}: {
  prisma: any;
  octokit: any;
  customerId: string;
  owner: string;
}) {
  return new DynamicStructuredTool({
    description:
      "User will explicitly ask for custom instructions to be updated.",
    func: async ({ newInstructions, issueId }) => {
      const res = await prisma.project.update({
        where: {
          customerId_name: {
            customerId,
            name: owner,
          },
        },
        data: {
          customInstructions: newInstructions,
        },
      });

      await addComment({
        octokit,
        issueId,
        comment: `Done. Your new instructions:\n\n> ${
          newInstructions || "none"
        }`,
      });

      return JSON.stringify(res);
    },
    name: "updateInstructions",
    schema: z.object({
      newInstructions: z.string().describe("The new instructions."),
      issueId: z.string().describe("The ID of the issue"),
    }),
  });
}
