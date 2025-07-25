import { createContext, useState, useEffect } from "react";
import type { User } from "../types/Types";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext<{
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}>({ user: null, setUser: () => { } });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                setUser(jwtDecode(token) as User);
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};