import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { generateApp, performResearch } from "./lib/openai";
import { googleAuth } from "./lib/google-auth";
import { googleEmailService, googleCalendarService } from "./lib/google-services";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo purposes, use userId = 1
      const projects = await storage.getProjects(1);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        userId: 1 // For demo purposes
      });
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // AI Generation endpoints
  app.post("/api/generate-app", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const result = await generateApp(prompt);
      res.json(result);
    } catch (error) {
      console.error("App generation error:", error);
      res.status(500).json({ error: "Failed to generate app" });
    }
  });

  app.post("/api/research", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const result = await performResearch(query);
      res.json(result);
    } catch (error) {
      console.error("Research error:", error);
      res.status(500).json({ error: "Failed to perform research" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      // Simple chat response using OpenAI
      const { generateChatResponse } = await import("./lib/openai");
      const response = await generateChatResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Google OAuth endpoints
  app.get("/auth/google", (req, res) => {
    const authUrl = googleAuth.getAuthUrl();
    res.json({ authUrl });
  });

  app.get("/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: "Authorization code required" });
      }

      const tokens = await googleAuth.getTokens(code as string);
      
      // Store tokens in session or database (simplified for demo)
      req.session = req.session || {};
      req.session.googleTokens = tokens;
      
      res.redirect("/?connected=true");
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Google Gmail endpoints
  app.get("/api/gmail/emails", async (req, res) => {
    try {
      const tokens = req.session?.googleTokens;
      if (!tokens) {
        return res.status(401).json({ error: "Google authentication required" });
      }

      const emails = await googleEmailService.getEmails(tokens);
      res.json(emails);
    } catch (error) {
      console.error("Gmail fetch error:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  app.post("/api/gmail/send", async (req, res) => {
    try {
      const tokens = req.session?.googleTokens;
      if (!tokens) {
        return res.status(401).json({ error: "Google authentication required" });
      }

      const { to, subject, body } = req.body;
      if (!to || !subject || !body) {
        return res.status(400).json({ error: "To, subject, and body are required" });
      }

      const result = await googleEmailService.sendEmail(tokens, { to, subject, body });
      res.json(result);
    } catch (error) {
      console.error("Gmail send error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Google Calendar endpoints
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const tokens = req.session?.googleTokens;
      if (!tokens) {
        return res.status(401).json({ error: "Google authentication required" });
      }

      const { timeMin, timeMax } = req.query;
      const events = await googleCalendarService.getEvents(
        tokens, 
        timeMin as string, 
        timeMax as string
      );
      res.json(events);
    } catch (error) {
      console.error("Calendar fetch error:", error);
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      const tokens = req.session?.googleTokens;
      if (!tokens) {
        return res.status(401).json({ error: "Google authentication required" });
      }

      const eventData = req.body;
      const result = await googleCalendarService.createEvent(tokens, eventData);
      res.json(result);
    } catch (error) {
      console.error("Calendar create error:", error);
      res.status(500).json({ error: "Failed to create calendar event" });
    }
  });

  // Authentication status endpoint
  app.get("/api/auth/status", (req, res) => {
    const isAuthenticated = !!req.session?.googleTokens;
    res.json({ 
      authenticated: isAuthenticated,
      services: isAuthenticated ? ['gmail', 'calendar'] : []
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
