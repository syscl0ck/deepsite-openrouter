// Model-specific context limits for OpenRouter models
export const OPENROUTER_MODEL_LIMITS: Record<string, { context_length: number; max_output_tokens: number }> = {
  "openai/gpt-4o": { context_length: 128_000, max_output_tokens: 4_096 },
  "openai/gpt-4o-mini": { context_length: 128_000, max_output_tokens: 4_096 },
  "anthropic/claude-3.5-sonnet": { context_length: 200_000, max_output_tokens: 8_192 },
  "google/gemini-pro-1.5": { context_length: 2_000_000, max_output_tokens: 8_192 },
  "deepseek/deepseek-chat-v3-0324": { context_length: 64_000, max_output_tokens: 4_096 },
  "deepseek/deepseek-r1": { context_length: 64_000, max_output_tokens: 4_096 },
  "Qwen/Qwen3-Coder-480B-A35B-Instruct": { context_length: 32_000, max_output_tokens: 4_096 },
  "moonshotai/Kimi-K2-Instruct": { context_length: 200_000, max_output_tokens: 4_096 },
  "deepseek-ai/DeepSeek-V3.1": { context_length: 64_000, max_output_tokens: 4_096 },
  "moonshotai/Kimi-K2-Instruct-0905": { context_length: 200_000, max_output_tokens: 4_096 },
};

export const PROVIDERS = {
  "fireworks-ai": {
    name: "Fireworks AI",
    max_tokens: 131_000,
    id: "fireworks-ai",
  },
  nebius: {
    name: "Nebius AI Studio",
    max_tokens: 131_000,
    id: "nebius",
  },
  sambanova: {
    name: "SambaNova",
    max_tokens: 32_000,
    id: "sambanova",
  },
  novita: {
    name: "NovitaAI",
    max_tokens: 16_000,
    id: "novita",
  },
  hyperbolic: {
    name: "Hyperbolic",
    max_tokens: 131_000,
    id: "hyperbolic",
  },
  together: {
    name: "Together AI",
    max_tokens: 128_000,
    id: "together",
  },
  groq: {
    name: "Groq",
    max_tokens: 16_384,
    id: "groq",
  },
  openrouter: {
    name: "OpenRouter",
    max_tokens: 200_000, // This is now used as a fallback
    id: "openrouter",
  },
};

export const MODELS = [
  {
    value: "deepseek/deepseek-chat-v3-0324",
    label: "DeepSeek V3 O324",
    providers: ["fireworks-ai", "nebius", "sambanova", "novita", "hyperbolic", "openrouter"],
    autoProvider: "openrouter",
  },
  // Backward compatibility for old model names
  {
    value: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3 O324 (Legacy)",
    providers: ["fireworks-ai", "nebius", "sambanova", "novita", "hyperbolic", "openrouter"],
    autoProvider: "openrouter",
  },
  {
    value: "deepseek/deepseek-r1",
    label: "DeepSeek R1 0528",
    providers: [
      "fireworks-ai",
      "novita",
      "hyperbolic",
      "nebius",
      "together",
      "sambanova",
      "openrouter",
    ],
    autoProvider: "openrouter",
    isThinker: true,
  },
  {
    value: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    label: "Qwen3 Coder 480B A35B Instruct",
    providers: ["novita", "hyperbolic", "openrouter"],
    autoProvider: "openrouter",
    isNew: true,
  },
  {
    value: "moonshotai/Kimi-K2-Instruct",
    label: "Kimi K2 Instruct",
    providers: ["together", "novita", "groq", "openrouter"],
    autoProvider: "groq",
  },
  {
    value: "deepseek-ai/DeepSeek-V3.1",
    label: "DeepSeek V3.1",
    providers: ["fireworks-ai", "novita", "openrouter"],
    isNew: true,
    autoProvider: "fireworks-ai",
  },
  {
    value: "moonshotai/Kimi-K2-Instruct-0905",
    label: "Kimi K2 Instruct 0905",
    providers: ["together", "groq", "novita", "openrouter"],
    isNew: true,
    autoProvider: "groq"
  },
  // OpenRouter-specific models
  {
    value: "openai/gpt-4o",
    label: "GPT-4o",
    providers: ["openrouter"],
    autoProvider: "openrouter",
    isNew: true,
  },
  {
    value: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    providers: ["openrouter"],
    autoProvider: "openrouter",
    isNew: true,
  },
  {
    value: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    providers: ["openrouter"],
    autoProvider: "openrouter",
    isNew: true,
  },
  {
    value: "google/gemini-pro-1.5",
    label: "Gemini Pro 1.5",
    providers: ["openrouter"],
    autoProvider: "openrouter",
    isNew: true,
  },
];

// Helper function to get appropriate token limits for OpenRouter models
export function getOpenRouterTokenLimits(modelValue: string, inputTokens: number = 0) {
  const modelLimits = OPENROUTER_MODEL_LIMITS[modelValue];
  
  if (!modelLimits) {
    // Fallback for unknown models
    return {
      max_tokens: Math.min(4_096, 200_000 - inputTokens - 1_000), // Reserve 1K tokens for safety
      context_length: 200_000
    };
  }
  
  // Calculate safe output tokens (leave buffer for input + safety margin)
  const safetyBuffer = 2_000; // 2K token safety buffer
  const availableForOutput = modelLimits.context_length - inputTokens - safetyBuffer;
  const maxOutputTokens = Math.min(
    modelLimits.max_output_tokens,
    Math.max(1_000, availableForOutput) // Minimum 1K tokens for output
  );
  
  return {
    max_tokens: maxOutputTokens,
    context_length: modelLimits.context_length
  };
}
