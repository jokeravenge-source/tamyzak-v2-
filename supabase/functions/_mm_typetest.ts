import { generateChatCompletion } from "npm:@lovable.dev/ai-gateway@0.1.11";

const M = "google/gemini-3.8-flash";

async function v1() {
  const d = await generateChatCompletion({
    model: M,
    messages: [{ role: "user", content: "hi" }],
  });
  return d.choices?.[0]?.message?.content;
}

async function v2() {
  const d = await generateChatCompletion({
    model: M,
    messages: [{ role: "user", content: "hi" }],
    max_tokens: 100,
  });
  return d.choices?.[0]?.message?.content;
}

async function v3() {
  const d = await generateChatCompletion({
    model: M,
    messages: [{ role: "user", content: "hi" }],
    max_tokens: 100,
    tools: [
      {
        type: "function",
        function: {
          name: "submit_mindmap",
          description: "x",
          parameters: { type: "object", properties: { nodes: { type: "array", items: { type: "object" } } }, required: ["nodes"] },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "submit_mindmap" } },
  });
  return d.choices?.[0]?.message?.tool_calls?.[0];
}

console.log(v1, v2, v3);
