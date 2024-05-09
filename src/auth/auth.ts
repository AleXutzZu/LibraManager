import {invoke} from "@tauri-apps/api/tauri";

export interface User {
    username: string,
    firstName: string,
    lastName: string,
    role: "admin" | "user",
}

class AuthProvider {
    private user: User | null;
    private authenticated: boolean;

    public constructor() {
        this.authenticated = false;
        this.user = null;
    }

    public isAuthenticated(): boolean {
        return this.authenticated;
    }

    public async login(username: string, password: string): Promise<void> {
        this.user = await invoke("login", {username, password});
        this.authenticated = true;
    }

    public async logout(): Promise<void> {
        this.authenticated = false;
        this.user = null;
    }

    public async getCurrentUser(): Promise<User | null> {
        if (!this.user) return null;
        this.user = await invoke("fetch_user", {username: this.user.username});
        return this.user;
    }
}

export const authProvider = new AuthProvider();
