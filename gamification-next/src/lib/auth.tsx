"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount and verify with server
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Verify user still exists in database
          const response = await fetch(`/api/auth/user?userId=${userData.id}`);
          if (response.ok) {
            const { user: verifiedUser } = await response.json();
            setUser(verifiedUser);
          } else {
            // User no longer exists, clear localStorage
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, demographics?: {
    gender?: string;
    education_level?: string;
    proficiency?: string;
    organization?: string;
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          gender: demographics?.gender,
          education_level: demographics?.education_level,
          proficiency: demographics?.proficiency,
          organization: demographics?.organization
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
