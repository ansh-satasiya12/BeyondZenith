import { createContext, useContext, useEffect, useState } from "react";
import { getMe, logout as logoutUser } from "../services/auth.service";
import { setUnauthenticatedHandler } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUnauthenticatedHandler(() => {
            setUser(null);
        });

        const restoreSession = async () => {
            try {
                const data = await getMe();

                setUser(data.data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const refreshUser = async () => {
        try {
            const data = await getMe();
            setUser(data.data.user);
            return data.data.user;
        } catch {
            setUser(null);
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        setUser,
        refreshUser,
        logout,
        loading,
        isAuthenticated: Boolean(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}