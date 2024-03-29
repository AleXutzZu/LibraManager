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

    user: {
        username: "a",
        firstName: "Anastasia-Maria",
        lastName: "b",
        role: "user",
    },

    async login(username: string, password: string) {
        await new Promise((r) => setTimeout(r, 1000));
        //
        authProvider.isAuthenticated = true;
        authProvider.user = {
            username: username,
            firstName: "b",
            lastName: "b",
            role: "admin",
        }
    },

    async logout() {
        //
        await new Promise((r) => setTimeout(r, 1000));
        authProvider.isAuthenticated = false;
        authProvider.user = undefined;
    }
}
