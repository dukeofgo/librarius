import { createContext } from "react";

interface AuthContext {
    isAuthenticated: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
    userScope: string,
    setUserScope: React.Dispatch<React.SetStateAction<string>>,

 }

export const AuthContext = createContext<AuthContext>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    userScope: '',
    setUserScope: () => {},
})