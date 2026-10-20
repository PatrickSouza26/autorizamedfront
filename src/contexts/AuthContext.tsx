"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/services/api';

export interface User {
  id: string; 
  nome: string;
  login: string;
  documento?: string;
  role?: string;
  prestadorId?: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  nome: string;
  login: string;
  role: string;
  prestadorId?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: LoginResponse) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadStoragedData() {
      const storagedToken = localStorage.getItem('token');
      const storagedUser = localStorage.getItem('user');

      if (storagedToken && storagedUser) {
        setToken(storagedToken);
        setUser(JSON.parse(storagedUser));
      } else {
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setIsLoading(false);
    }

    loadStoragedData();
  }, [pathname, router]);

  const signIn = async (data: LoginResponse) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);

    const userObj: User = {
      id: data.id,
      nome: data.nome,
      login: data.login,
      documento: data.login,
      role: data.role,
      prestadorId: data.prestadorId,
    };

    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
