/**
 * Type definitions for the HackQuest AI application
 */

export interface AgentResult {
    selected_hackathon?: HackathonInfo;
    win_probability?: number;
    judge_critique?: string;
    boilerplate_code?: CodeBlock;
}

export interface HackathonInfo {
    title: string;
    ps: string;
    url?: string;
    prize?: string;
    difficulty?: string;
}

export interface CodeBlock {
    content: string;
    language?: string;
}

export interface WebSocketMessage {
    event: "node_complete" | "flow_complete" | "error" | "status_update";
    node?: string;
    data?: AgentResult;
    message?: string;
}

export interface AgentRequest {
    github_id: string;
    skills: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export type AgentStatus = "idle" | "loading" | "success" | "error";
export interface Submission {
    github_id: string;
    skills: string[];
}