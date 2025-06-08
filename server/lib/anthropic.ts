import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_ENV_VAR || "default_key",
});

export async function researchTopic(query: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a research assistant. Provide comprehensive research on the given topic.
      Return your response in JSON format with:
      {
        "summary": "Executive summary of findings",
        "keyPoints": ["Array of key findings"],
        "sources": ["Suggested sources to investigate"],
        "insights": ["Analytical insights"],
        "relatedTopics": ["Related research areas"]
      }`,
      max_tokens: 2000,
      messages: [
        { role: 'user', content: `Research this topic comprehensively: ${query}` }
      ],
    });

    return JSON.parse(response.content[0].text);
  } catch (error) {
    console.error("Anthropic research error:", error);
    throw new Error("Failed to perform research");
  }
}

export async function analyzeContent(content: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      system: `You are a content analysis expert. Analyze the provided content for insights, structure, and improvements.
      Return your response in JSON format with:
      {
        "analysis": "Detailed analysis",
        "structure": "Content structure assessment",
        "improvements": ["Suggested improvements"],
        "sentiment": "Overall sentiment",
        "keyThemes": ["Main themes identified"]
      }`,
      max_tokens: 1500,
      messages: [
        { role: 'user', content: `Analyze this content: ${content}` }
      ],
    });

    return JSON.parse(response.content[0].text);
  } catch (error) {
    console.error("Anthropic analysis error:", error);
    throw new Error("Failed to analyze content");
  }
}
