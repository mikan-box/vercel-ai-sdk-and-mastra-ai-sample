import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
 
// 30 秒間のストリーミングを許可する
export const maxDuration = 30;
 
// POST メソッドを使用してリクエストを処理する
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  const result = streamText({
    model: openai('gpt-4.1-mini'),
    messages,
  });
 
  // HTTP ストリームレスポンスを作成する
  return result.toDataStreamResponse();
}