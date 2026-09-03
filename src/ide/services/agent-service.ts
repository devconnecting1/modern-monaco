import type { IDisposable } from "../event";

export enum AgentStatus {
  IDLE = "idle",
  THINKING = "thinking",
  EXECUTING = "executing",
  ERROR = "error",
  WAITING_INPUT = "waiting_input",
}

export interface AgentMessage {
  readonly role: "user" | "assistant" | "system" | "tool";
  readonly content: string;
  readonly timestamp: number;
  readonly agentId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AgentToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: Record<string, unknown>;
  readonly result?: string;
}

export interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly status: AgentStatus;
  readonly model?: string;
  send(message: string): Promise<AgentMessage>;
  executeTool(toolCall: AgentToolCall): Promise<string>;
  onStatusChange(listener: (status: AgentStatus) => void): IDisposable;
  onMessage(listener: (message: AgentMessage) => void): IDisposable;
  dispose(): void;
}

export interface IAgentService {
  readonly _serviceBrand: undefined;
  readonly onDidAgentStatusChange: IDisposable;
  readonly agents: readonly IAgent[];
  createAgent(config: IAgentConfig): IAgent;
  getAgent(id: string): IAgent | undefined;
  removeAgent(id: string): void;
}

export interface IAgentConfig {
  readonly id?: string;
  readonly name: string;
  readonly model?: string;
  readonly systemPrompt?: string;
  readonly tools?: readonly AgentToolDefinition[];
}

export interface AgentToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, AgentToolParameter>;
  readonly handler: (args: Record<string, unknown>) => Promise<string>;
}

export interface AgentToolParameter {
  readonly type: "string" | "number" | "boolean" | "object" | "array";
  readonly description?: string;
  readonly required?: boolean;
  readonly default?: unknown;
}
