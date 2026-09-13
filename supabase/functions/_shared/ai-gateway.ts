import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(apiKey: string) {
  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
  // Gemini models work without strict json_schema mode
  return (modelId: string) => provider(modelId as any, { supportsStructuredOutputs: false } as any);
}