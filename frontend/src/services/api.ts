/**
 * API Service - Centralized API communication layer
 */

import { config } from "@/config";

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        email: string;
        username: string;
        full_name?: string;
        avatar_url?: string;
    };
}

export interface HackathonMatch {
    id: string;
    title: string;
    description: string;
    platform: string;
    difficulty: string;
    skills_match: number;
    win_probability: number;
    prize_pool: number;
    matched_skills: string[];
    missing_skills: string[];
    start_date: string;
    end_date: string;
    registration_link: string;
    theme?: string;
}

export interface AgentAnalysisRequest {
    user_id: string;
    skills: string[];
    github_summary?: string;
}

export interface AgentAnalysisResponse {
    status: string;
    user_id: string;
    selected_hackathon?: {
        id: string;
        title: string;
        ps: string;
        difficulty?: string;
        prize_pool?: number;
    };
    win_probability: number;
    judge_critique?: string;
    boilerplate_code?: {
        backend?: string;
        frontend?: string;
        docker_compose?: string;
        requirements?: string;
        package_json?: string;
    };
    timestamp: string;
}

export interface GenerateCodeRequest {
    user_id: string;
    problem_statement: string;
    skills: string[];
}

class APIClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.loadToken();
    }

    private loadToken() {
        this.token = localStorage.getItem("access_token");
    }

    private setToken(token: string) {
        this.token = token;
        localStorage.setItem("access_token", token);
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Authentication endpoints
    async register(
        email: string,
        username: string,
        password: string,
        full_name?: string
    ): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({
                email,
                username,
                password,
                full_name,
            }),
        });

        const data = await this.handleResponse<AuthResponse>(response);
        this.setToken(data.access_token);
        return data;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });

        const data = await this.handleResponse<AuthResponse>(response);
        this.setToken(data.access_token);
        return data;
    }

    async refreshToken(): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
            method: "POST",
            headers: this.getHeaders(),
        });

        const data = await this.handleResponse<AuthResponse>(response);
        this.setToken(data.access_token);
        return data;
    }

    // Profile endpoints
    async getProfile() {
        const response = await fetch(`${this.baseUrl}/api/auth/me?token=${this.token}`, {
            method: "GET",
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async updateProfile(data: Record<string, any>) {
        // Profile updates would be done via a separate endpoint
        // For now, storing in localStorage
        localStorage.setItem("user", JSON.stringify(data));
        return data;
    }

    async syncGitHub(githubToken: string) {
        // GitHub sync would be implemented via a separate endpoint
        // For now, just storing the token
        localStorage.setItem("github_token", githubToken);
        return { success: true };
    }

    // Matching endpoints
    async getMatches(limit: number = 10) {
        const response = await fetch(
            `${this.baseUrl}/api/matching/recommendations?limit=${limit}`,
            {
                method: "GET",
                headers: this.getHeaders(),
            }
        );

        return this.handleResponse<{ data: HackathonMatch[] }>(response);
    }

    async findMatches(filters?: Record<string, any>) {
        const query = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                query.append(key, String(value));
            });
        }

        const response = await fetch(
            `${this.baseUrl}/api/matching/find?${query.toString()}`,
            {
                method: "GET",
                headers: this.getHeaders(),
            }
        );

        return this.handleResponse<{ data: HackathonMatch[] }>(response);
    }

    async getHackathonDetail(hackathonId: string) {
        const response = await fetch(
            `${this.baseUrl}/api/matching/${hackathonId}`,
            {
                method: "GET",
                headers: this.getHeaders(),
            }
        );

        return this.handleResponse<{ data: HackathonMatch }>(response);
    }

    // Agent endpoints
    async analyzeUser(
        request: AgentAnalysisRequest
    ): Promise<AgentAnalysisResponse> {
        const response = await fetch(`${this.baseUrl}/api/agent/analyze`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        return this.handleResponse<AgentAnalysisResponse>(response);
    }

    async getUserMatches(userId: string, limit: number = 5) {
        const response = await fetch(
            `${this.baseUrl}/api/agent/hackathons/${userId}/matches?limit=${limit}`,
            {
                method: "GET",
                headers: this.getHeaders(),
            }
        );

        return this.handleResponse(response);
    }

    async scoreMatch(userId: string, hackathonId: string) {
        const response = await fetch(
            `${this.baseUrl}/api/agent/matches/score?user_id=${userId}&hackathon_id=${hackathonId}`,
            {
                method: "POST",
                headers: this.getHeaders(),
            }
        );

        return this.handleResponse(response);
    }

    // Code generation endpoints
    async generateCode(request: GenerateCodeRequest) {
        const response = await fetch(`${this.baseUrl}/api/generate/boilerplate`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        return this.handleResponse(response);
    }

    async explainCode(code: string) {
        const response = await fetch(`${this.baseUrl}/api/generate/code/explain`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ code }),
        });

        return this.handleResponse(response);
    }

    async optimizeCode(code: string) {
        const response = await fetch(`${this.baseUrl}/api/generate/code/optimize`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ code }),
        });

        return this.handleResponse(response);
    }

    // Health check
    async healthCheck() {
        const response = await fetch(`${this.baseUrl}/api/health`, {
            method: "GET",
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    // Logout
    logout() {
        this.token = null;
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    getToken(): string | null {
        return this.token;
    }
}

export const apiClient = new APIClient();
