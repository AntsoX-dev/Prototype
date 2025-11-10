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
      try {
        setIsLoading(true);
        const userInfo = localStorage.getItem("utilisateur");
        const token = localStorage.getItem("token");

        if (userInfo && token) {
          setUtilisateur(JSON.parse(userInfo));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (!isPublicRoute && currentPath !== "/signin") {
            navigate("/signin");
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification :", err);
        setIsAuthenticated(false);
        if (!isPublicRoute) navigate("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isPublicRoute, navigate, currentPath]);

  useEffect(() => {
    const handleForceLogout = () => {
      console.warn("⚠️ Token invalide ou expiré — déconnexion forcée");
      logout();
      navigate("/signin");
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, [navigate]);

  const login = (data: any) => {
    try {
      if (!data?.token || !data?.utilisateur) {
        throw new Error("Les données de connexion sont incomplètes.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));
      setUtilisateur(data.utilisateur);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  };

  // 🚪 Déconnexion
  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateur");
      setUtilisateur(null);
      setIsAuthenticated(false);
      queryClient.clear();
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
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

// ✅ Hook d’accès au contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};
