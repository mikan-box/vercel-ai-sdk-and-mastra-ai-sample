import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

const agent = new Agent({
  name: 'mastra',
  instructions: '',
  model: openai("gpt-4.1-mini"),
})

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const stream = await agent.stream(messages);
  
  return stream.toDataStreamResponse();
}