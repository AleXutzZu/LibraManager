import {invoke} from "@tauri-apps/api/tauri";

export interface User {
    username: string,
    firstName: string,
    lastName: string,
    role: "admin" | "user",
}

interface AuthProvider {
    isAuthenticated: boolean,
    user?: User,
    login: (username: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
}

export const authProvider: AuthProvider = {
    isAuthenticated: false,

    user: undefined,

    async login(username: string, password: string) {
        this.user = await invoke("login", {username, password});
        this.isAuthenticated = true;
    },

    async logout() {
        authProvider.isAuthenticated = false;
        authProvider.user = undefined;
    }
}
