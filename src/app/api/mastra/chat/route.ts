import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const confirm = createTool({
  id: '確認',
  description: 'ユーザーに承認をもらうツール。承認すると何が起こるのかをユーザに説明する。',
  inputSchema: z.object({
    message: z.string().describe('ユーザに確認を促すメッセージ'),
  }),
});

const getJiraIssue = createTool({
  id: "JIRAのイシューを取得する",
  inputSchema: z.object({
    searchKeyWord: z.string().describe("検索キーワード"),
  }),
  description: `JIRAのイシューを検索するツールです。`,
  execute: async ({ context: { searchKeyWord } }) => {
    const encodedCredentials = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

    const url = new URL(`${process.env.JIRA_API_ENDPOINT}/rest/api/2/search?jql=text~\"${searchKeyWord}\"&maxResults=5`);

    const res = await fetch(url, {
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Accept': 'application/json',
      }
    });


    const { issues } = await res.json();
    console.log(res)
    const issueSummaryList = issues?.map((issue) => (
      `${issue?.key}: ${issue?.fields?.summary}`
    ));

    return issueSummaryList;
  },
});

const updateJiraIssue = createTool({
  id: 'JIRAのイシューを更新する',
  description: `
    IRAのイシューを更新する。更新処理を実行する場合、以下の手順を踏むこと
    - issueIdと具体的な変更指示が無い場合は実行せずにユーザに問い合わせてください。
    - 最終確認としてこのツールを使う前に必ずconfirmツールを使用して確認してから実行してください。
  `,
  inputSchema: z.object({
    issueId: z.string().describe('イシューのID'),
    fields: z.object({
      summary: z.string().optional().describe('イシューのサマリー'),
      description: z.string().optional().describe('イシューの詳細'),
    }).describe('JIRAデータを更新するフィールド。Example: { summary: "New Summary Title", description: "New Description }"}')
  }),
  execute: async ({ context: { issueId, fields } }) => {
    console.log('updateJiraIssue tool called');
    const encodedCredentials = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

    const url = new URL(`${process.env.JIRA_API_ENDPOINT}/rest/api/2/issue/${issueId}`);

    const res = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        fields
      }),
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Accept': 'application/json',
        "Content-Type": "application/json"
      },
    });

    return { issueId, fields };
  },
});


const agent = new Agent({
  name: 'mastra',
  instructions: '',
  model: openai("gpt-4o-mini"),
  tools: {
    getJiraIssue,
    updateJiraIssue,
    confirm,
  },
})

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await agent.stream(messages);

  return stream.toDataStreamResponse();
}