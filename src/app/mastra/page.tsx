"use client";
 
import { useChat } from "@ai-sdk/react";
 
export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({ api: "/api/mastra/chat",maxSteps: 2 });
 
    console.log(messages)
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="space-y-4 mb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 ml-8 border-blue-200 border"
                : "bg-gray-100 mr-8 border-gray-200 border"
            }`}
          >
            <div className="font-semibold mb-1 text-sm text-gray-600">
              {message.role === "user" ? "You" : "Agent"}
            </div>
            {message.parts?.map((part, index) => {
              switch (part.type) {
                case 'text':
                  return <div className="mt-4">{part.text}</div>;

                case "tool-invocation": {
                  if (part.toolInvocation.toolName === 'confirm') {
                    return (
                      <div key={`toolCallId-${part.toolInvocation.toolCallId}`}>
                        <span>{part.toolInvocation.args.message}</span>
                        {part.toolInvocation.state === 'call' &&
                          <div className="mt-4 flex justify-end">
                            <button
                              key={index}
                              className="bg-green-600 py-2 px-4 rounded-sm cursor-pointer text-white bold"
                              onClick={() => addToolResult({
                                toolCallId: part.toolInvocation.toolCallId,
                                result: 'Yes, confirmed.'
                              })}
                            >承認</button>
                            <button
                              key={index}
                              className="bg-orange-600 py-2 px-4 rounded-sm cursor-pointer text-white bold ml-4"
                              onClick={() => addToolResult({
                                toolCallId: part.toolInvocation.toolCallId,
                                result: 'No, denied.'
                              })}
                            >拒否</button>
                          </div>
                        }
                        
                      </div>
                    );
                  }
                }
                default: return null;
              }
            })}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}