import { 
  users, projects, templates, conversations, messages, documents, knowledgeBase, aiModels, integrations,
  type User, type InsertUser, type Project, type InsertProject, type Template, type InsertTemplate,
  type Conversation, type InsertConversation, type Message, type InsertMessage,
  type Document, type InsertDocument, type KnowledgeBase, type InsertKnowledgeBase,
  type AiModel, type InsertAiModel, type Integration, type InsertIntegration
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project management
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Template management
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Conversation management
  getConversations(userId: number, projectId?: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;
  
  // Message management
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Document management
  getDocuments(projectId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Knowledge base management
  getKnowledgeBase(userId: number, projectId?: number): Promise<KnowledgeBase[]>;
  createKnowledgeBase(knowledge: InsertKnowledgeBase): Promise<KnowledgeBase>;
  searchKnowledgeBase(query: string, userId: number, projectId?: number): Promise<KnowledgeBase[]>;
  
  // AI Models management
  getAiModels(): Promise<AiModel[]>;
  getAiModel(id: number): Promise<AiModel | undefined>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;
  
  // Integration management
  getIntegrations(userId: number, projectId?: number): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProjects(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  // Conversation management
  async getConversations(userId: number, projectId?: number): Promise<Conversation[]> {
    if (projectId) {
      return await db.select().from(conversations)
        .where(and(eq(conversations.userId, userId), eq(conversations.projectId, projectId)));
    }
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async deleteConversation(id: number): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id));
    return result.rowCount > 0;
  }

  // Message management
  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Document management
  async getDocuments(projectId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.projectId, projectId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }

  // Knowledge base management
  async getKnowledgeBase(userId: number, projectId?: number): Promise<KnowledgeBase[]> {
    if (projectId) {
      return await db.select().from(knowledgeBase)
        .where(and(eq(knowledgeBase.userId, userId), eq(knowledgeBase.projectId, projectId)));
    }
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId));
  }

  async createKnowledgeBase(insertKnowledge: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [knowledge] = await db
      .insert(knowledgeBase)
      .values(insertKnowledge)
      .returning();
    return knowledge;
  }

  async searchKnowledgeBase(query: string, userId: number, projectId?: number): Promise<KnowledgeBase[]> {
    // Simple text search - in production, use vector embeddings
    if (projectId) {
      return await db.select().from(knowledgeBase)
        .where(and(eq(knowledgeBase.userId, userId), eq(knowledgeBase.projectId, projectId)));
    }
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.userId, userId));
  }

  // AI Models management
  async getAiModels(): Promise<AiModel[]> {
    return await db.select().from(aiModels).where(eq(aiModels.isEnabled, true));
  }

  async getAiModel(id: number): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model || undefined;
  }

  async createAiModel(insertModel: InsertAiModel): Promise<AiModel> {
    const [model] = await db
      .insert(aiModels)
      .values(insertModel)
      .returning();
    return model;
  }

  // Integration management
  async getIntegrations(userId: number, projectId?: number): Promise<Integration[]> {
    if (projectId) {
      return await db.select().from(integrations)
        .where(and(eq(integrations.userId, userId), eq(integrations.projectId, projectId)));
    }
    return await db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set(updates)
      .where(eq(integrations.id, id))
      .returning();
    return integration || undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private templates: Map<number, Template>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentTemplateId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.templates = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentTemplateId = 1;
    
    // Initialize with default templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Todo App",
        description: "Simple task management application",
        type: "todo",
        icon: "📱",
        content: {
          components: ["TaskList", "TaskItem", "AddTask"],
          features: ["Add tasks", "Mark complete", "Delete tasks"],
          code: "// React Todo App template code"
        }
      },
      {
        name: "E-commerce",
        description: "Online store with cart functionality",
        type: "ecommerce",
        icon: "🛒",
        content: {
          components: ["ProductList", "Cart", "Checkout"],
          features: ["Product catalog", "Shopping cart", "Checkout"],
          code: "// React E-commerce template code"
        }
      },
      {
        name: "Dashboard",
        description: "Analytics and data visualization",
        type: "dashboard",
        icon: "📊",
        content: {
          components: ["Charts", "Metrics", "DataTable"],
          features: ["Charts", "KPIs", "Data tables"],
          code: "// React Dashboard template code"
        }
      },
      {
        name: "Blog",
        description: "Content management system",
        type: "blog",
        icon: "📝",
        content: {
          components: ["PostList", "PostDetail", "Editor"],
          features: ["Create posts", "Edit content", "Categories"],
          code: "// React Blog template code"
        }
      }
    ];

    defaultTemplates.forEach(template => {
      const id = this.currentTemplateId++;
      this.templates.set(id, { ...template, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }
}

export const storage = new DatabaseStorage();
