/**
 * API Service - Centralized API communication layer
 */
import { config } from "@/config";
class APIClient {
    baseUrl;
    token = null;
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.loadToken();
    }
    loadToken() {
        this.token = localStorage.getItem("access_token");
    }
    setToken(token) {
        this.token = token;
        localStorage.setItem("access_token", token);
    }
    getHeaders() {
        const headers = {
            "Content-Type": "application/json",
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
        return response.json();
    }
    // Authentication endpoints
    async register(email, username, password, full_name) {
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
        const data = await this.handleResponse(response);
        this.setToken(data.access_token);
        return data;
    }
    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        const data = await this.handleResponse(response);
        this.setToken(data.access_token);
        return data;
    }
    async refreshToken() {
        const response = await fetch(`${this.baseUrl}/api/auth/token/refresh`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        const data = await this.handleResponse(response);
        this.setToken(data.access_token);
        return data;
    }
    // Profile endpoints
    async getProfile() {
        const response = await fetch(`${this.baseUrl}/api/profile`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    async updateProfile(data) {
        const response = await fetch(`${this.baseUrl}/api/profile`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    }
    async syncGitHub(githubUsername) {
        const response = await fetch(`${this.baseUrl}/api/profile/sync-github`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ github_username: githubUsername }),
        });
        return this.handleResponse(response);
    }
    // Matching endpoints
    async getMatches(limit = 10) {
        const response = await fetch(`${this.baseUrl}/api/matching/recommendations?limit=${limit}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    async findMatches(filters) {
        const query = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                query.append(key, String(value));
            });
        }
        const response = await fetch(`${this.baseUrl}/api/matching/find?${query.toString()}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    async getHackathonDetail(hackathonId) {
        const response = await fetch(`${this.baseUrl}/api/matching/${hackathonId}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    // Agent endpoints
    async analyzeUser(request) {
        const response = await fetch(`${this.baseUrl}/api/agent/analyze`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });
        return this.handleResponse(response);
    }
    async getUserMatches(userId, limit = 5) {
        const response = await fetch(`${this.baseUrl}/api/agent/hackathons/${userId}/matches?limit=${limit}`, {
            method: "GET",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    async scoreMatch(userId, hackathonId) {
        const response = await fetch(`${this.baseUrl}/api/agent/matches/score?user_id=${userId}&hackathon_id=${hackathonId}`, {
            method: "POST",
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    // Code generation endpoints
    async generateCode(request) {
        const response = await fetch(`${this.baseUrl}/api/generate/boilerplate`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });
        return this.handleResponse(response);
    }
    async explainCode(code) {
        const response = await fetch(`${this.baseUrl}/api/generate/code/explain`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ code }),
        });
        return this.handleResponse(response);
    }
    async optimizeCode(code) {
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
    isAuthenticated() {
        return !!this.token;
    }
    getToken() {
        return this.token;
    }
}
export const apiClient = new APIClient();
