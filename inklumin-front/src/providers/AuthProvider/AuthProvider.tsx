import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthResponse,
  ConfigDataResponse,
  LoginRequest,
  RegisterRequest,
} from "@/api/inkLuminApi/generatedTypes";
import {
  getConfigFromServer as getConfigRequest,
  login as loginRequest,
  register as registerRequest,
  saveConfigToServer as saveConfigRequest,
  ServiceResult,
  validateToken as validateTokenRequest,
} from "@/services/authService";

interface User {
  token: string;
  username: string;
  displayName: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<ServiceResult<AuthResponse>>;
  register: (userData: RegisterRequest) => Promise<ServiceResult<AuthResponse>>;
  logout: () => void;
  saveConfigToServer: (
    configData: Record<string, unknown>
  ) => Promise<ServiceResult<ConfigDataResponse>>;
  getConfigFromServer: () => Promise<ServiceResult<Record<string, unknown>>>;
}

// Контекст для аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Провайдер аутентификации
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка токена при загрузке приложения
    const token = localStorage.getItem("authToken");
    if (token) {
      validateStoredToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateStoredToken = async (token: string) => {
    try {
      const response = await validateTokenRequest(token);
      if (response.success && response.data) {
        setUser({
          token,
          username: response.data.username,
          displayName: response.data.displayName || response.data.username,
          userId: response.data.userId,
        });
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<ServiceResult<AuthResponse>> => {
    try {
      const response = await loginRequest(credentials);
      if (response.success && response.data) {
        const userData = {
          token: response.data.token,
          username: response.data.username,
          displayName: response.data.displayName || response.data.username,
          userId: response.data.userId,
        };
        setUser(userData);
        localStorage.setItem("authToken", response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: "Ошибка соединения с сервером" };
    }
  };

  const register = async (userData: RegisterRequest): Promise<ServiceResult<AuthResponse>> => {
    try {
      const response = await registerRequest(userData);
      if (response.success && response.data) {
        const userInfo = {
          token: response.data.token,
          username: response.data.username,
          displayName: response.data.displayName || response.data.username,
          userId: response.data.userId,
        };
        setUser(userInfo);
        localStorage.setItem("authToken", response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: "Ошибка соединения с сервером" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  const saveConfigToServer = async (
    configData: Record<string, unknown>
  ): Promise<ServiceResult<ConfigDataResponse>> => {
    if (!user?.token) {
      return { success: false, message: "Пользователь не авторизован" };
    }

    try {
      return await saveConfigRequest(user.token, configData);
    } catch (error) {
      return { success: false, message: "Ошибка соединения с сервером" };
    }
  };

  const getConfigFromServer = async (): Promise<ServiceResult<Record<string, unknown>>> => {
    if (!user?.token) {
      return { success: false, message: "Пользователь не авторизован" };
    }

    try {
      return await getConfigRequest(user.token);
    } catch (error) {
      return { success: false, message: "Ошибка соединения с сервером" };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    saveConfigToServer,
    getConfigFromServer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
