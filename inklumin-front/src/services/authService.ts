import { inkLuminAPI } from '@/api/inkLuminApi/inkLuminApi';
import {
  AuthResponse,
  ConfigDataResponse,
  LoginRequest,
  RegisterRequest,
} from '@/api/inkLuminApi/generatedTypes';

export interface ServiceResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const login = async (
  credentials: LoginRequest
): Promise<ServiceResult<AuthResponse>> => {
  try {
    const response = await inkLuminAPI.login(credentials);
    return response;
  } catch {
    return { success: false, message: 'Ошибка соединения с сервером' };
  }
};

export const register = async (
  userData: RegisterRequest
): Promise<ServiceResult<AuthResponse>> => {
  try {
    const response = await inkLuminAPI.register(userData);
    return response;
  } catch {
    return { success: false, message: 'Ошибка соединения с сервером' };
  }
};

export const validateToken = async (
  token: string
): Promise<ServiceResult<AuthResponse>> => {
  try {
    const response = await inkLuminAPI.validateToken(token);
    return response;
  } catch {
    return { success: false, message: 'Ошибка соединения с сервером' };
  }
};

export const saveConfigToServer = async (
  token: string,
  configData: Record<string, unknown>
): Promise<ServiceResult<ConfigDataResponse>> => {
  try {
    const response = await inkLuminAPI.saveConfigData(token, configData);
    return response;
  } catch {
    return { success: false, message: 'Ошибка соединения с сервером' };
  }
};

export const getConfigFromServer = async (
  token: string
): Promise<ServiceResult<Record<string, unknown>>> => {
  try {
    const response = await inkLuminAPI.getConfigData(token);
    if (response.success && response.data) {
      const configData = JSON.parse(response.data.configData);
      return { success: true, data: configData };
    }
    return { success: false, message: response.message };
  } catch {
    return { success: false, message: 'Ошибка соединения с сервером' };
  }
};
