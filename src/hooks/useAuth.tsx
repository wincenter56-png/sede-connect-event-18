import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const loginTime = localStorage.getItem("adminLoginTime");
    
    if (loggedIn === "true" && loginTime) {
      // Verificar se a sessão não expirou (24 horas)
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsLoggedIn(true);
      } else {
        logout();
      }
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminLoginTime");
    setIsLoggedIn(false);
  };

  return { isLoggedIn, isLoading, logout, checkAuthStatus };
};