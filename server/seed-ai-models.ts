import { db } from "./db";
import { aiModels } from "@shared/schema";

const defaultAiModels = [
  {
    name: "GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code", "vision", "function_calling"],
    maxTokens: 128000,
    costPer1kTokens: 0.005,
    description: "OpenAI's most advanced multimodal model with vision and function calling capabilities"
  },
  {
    name: "GPT-4o Mini",
    provider: "openai", 
    modelId: "gpt-4o-mini",
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code"],
    maxTokens: 128000,
    costPer1kTokens: 0.00015,
    description: "Fast and cost-effective version of GPT-4o"
  },
  {
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    modelId: "claude-3-5-sonnet-20241022",
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code", "vision", "function_calling"],
    maxTokens: 200000,
    costPer1kTokens: 0.003,
    description: "Anthropic's most intelligent model with excellent reasoning and coding capabilities"
  },
  {
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    modelId: "claude-3-5-haiku-20241022", 
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code"],
    maxTokens: 200000,
    costPer1kTokens: 0.0008,
    description: "Fast and lightweight model from Anthropic"
  },
  {
    name: "Llama 3.1 8B",
    provider: "huggingface",
    modelId: "meta-llama/Llama-3.1-8B-Instruct",
    apiEndpoint: "https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct",
    isEnabled: true,
    isFree: true,
    capabilities: ["text", "code"],
    maxTokens: 128000,
    costPer1kTokens: 0,
    description: "Meta's open-source language model, free via HuggingFace"
  },
  {
    name: "Mistral 7B",
    provider: "huggingface", 
    modelId: "mistralai/Mistral-7B-Instruct-v0.3",
    apiEndpoint: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    isEnabled: true,
    isFree: true,
    capabilities: ["text", "code"],
    maxTokens: 32000,
    costPer1kTokens: 0,
    description: "Mistral's efficient 7B parameter model, free via HuggingFace"
  },
  {
    name: "CodeLlama 13B",
    provider: "huggingface",
    modelId: "codellama/CodeLlama-13b-Instruct-hf", 
    apiEndpoint: "https://api-inference.huggingface.co/models/codellama/CodeLlama-13b-Instruct-hf",
    isEnabled: true,
    isFree: true,
    capabilities: ["code"],
    maxTokens: 16000,
    costPer1kTokens: 0,
    description: "Meta's specialized code generation model, free via HuggingFace"
  },
  {
    name: "OpenRouter GPT-4",
    provider: "openrouter",
    modelId: "openai/gpt-4-turbo",
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code", "vision"],
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    description: "GPT-4 Turbo via OpenRouter with competitive pricing"
  },
  {
    name: "OpenRouter Claude 3.5",
    provider: "openrouter",
    modelId: "anthropic/claude-3.5-sonnet",
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions", 
    isEnabled: true,
    isFree: false,
    capabilities: ["text", "code", "vision"],
    maxTokens: 200000,
    costPer1kTokens: 0.0075,
    description: "Claude 3.5 Sonnet via OpenRouter"
  }
];

export async function seedAiModels() {
  try {
    console.log("Seeding AI models...");
    
    for (const model of defaultAiModels) {
      await db.insert(aiModels).values({
        name: model.name,
        provider: model.provider,
        modelId: model.modelId,
        apiEndpoint: model.apiEndpoint,
        isEnabled: model.isEnabled,
        isFree: model.isFree,
        capabilities: model.capabilities,
        maxTokens: model.maxTokens,
        costPer1kTokens: model.costPer1kTokens,
        description: model.description
      }).onConflictDoNothing();
    }
    
    console.log("AI models seeded successfully!");
  } catch (error) {
    console.error("Error seeding AI models:", error);
  }
}