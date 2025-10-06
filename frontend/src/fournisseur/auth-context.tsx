import { createContext, useContext, useEffect, useState } from "react";
import type { Utilisateur } from "../types";
import { queryClient } from "./react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { publicRoutes } from "../libs/index";

interface AuthContextType {
  utilisateur: Utilisateur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void> | void;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const isPublicRoute = publicRoutes.includes(currentPath);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const userInfo = localStorage.getItem("utilisateur");
      if (userInfo) {
        setUtilisateur(JSON.parse(userInfo));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (!isPublicRoute) navigate("/signin");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isPublicRoute, navigate]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
      navigate("/signin");
    };
    window.addEventListener("force-logout", handleLogout);
    return () => window.removeEventListener("force-logout", handleLogout);
  }, [navigate]);

  const login = (data: any) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
  setUtilisateur(data.utilisateur);
  setIsAuthenticated(true);
  navigate("/dashboard");
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setUtilisateur(null);
    setIsAuthenticated(false);
    queryClient.clear();
  };

  const values = {
    utilisateur,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};
