import { apiRequest } from "./queryClient";

export interface GenerateAppRequest {
  prompt: string;
}

export interface GenerateAppResponse {
  name: string;
  description: string;
  code: string;
  components: string[];
  features: string[];
  suggestions: string[];
}

export interface ResearchRequest {
  query: string;
}

export interface ResearchResponse {
  summary: string;
  keyPoints: string[];
  sources: string[];
  insights: string[];
  relatedTopics: string[];
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export const api = {
  generateApp: async (data: GenerateAppRequest): Promise<GenerateAppResponse> => {
    const response = await apiRequest("POST", "/api/generate-app", data);
    return response.json();
  },

  research: async (data: ResearchRequest): Promise<ResearchResponse> => {
    const response = await apiRequest("POST", "/api/research", data);
    return response.json();
  },

  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiRequest("POST", "/api/chat", data);
    return response.json();
  },

  getProjects: async () => {
    const response = await apiRequest("GET", "/api/projects");
    return response.json();
  },

  getTemplates: async () => {
    const response = await apiRequest("GET", "/api/templates");
    return response.json();
  },

  createProject: async (project: any) => {
    const response = await apiRequest("POST", "/api/projects", project);
    return response.json();
  },

  updateProject: async (id: number, updates: any) => {
    const response = await apiRequest("PUT", `/api/projects/${id}`, updates);
    return response.json();
  },

  deleteProject: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/projects/${id}`);
    return response.json();
  },
};
