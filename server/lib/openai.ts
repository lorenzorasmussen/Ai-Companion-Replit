import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateApp(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert React developer. Generate a complete React application based on the user's description. 
          Return your response in JSON format with the following structure:
          {
            "name": "App Name",
            "description": "Brief description",
            "code": "Complete React component code",
            "components": ["List of component names"],
            "features": ["List of key features"],
            "suggestions": ["Array of improvement suggestions"]
          }
          
          Use modern React with hooks, TypeScript, and Tailwind CSS for styling. Make the code production-ready and well-structured.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw new Error("Failed to generate app with AI");
  }
}

export async function generateChatResponse(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI coding assistant. You can help with app development, explain code, and answer programming questions. Be concise and helpful."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI chat error:", error);
    throw new Error("Failed to generate chat response");
  }
}

export async function generateNoteContent(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI note-taking assistant. Help organize, summarize, and enhance notes.
          Return your response in JSON format with:
          {
            "content": "Enhanced/organized note content",
            "summary": "Brief summary",
            "tags": ["relevant", "tags"],
            "suggestions": ["improvement suggestions"]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI note generation error:", error);
    throw new Error("Failed to generate note content");
  }
}
