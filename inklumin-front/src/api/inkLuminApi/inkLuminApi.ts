// This file is generated from openapi.yaml
// Do not edit manually
import {
  ApiResponse,
  AuthResponse,
  BookResponse,
  BookShortInfo,
  ConfigDataResponse,
  LoginRequest,
  NotesDataResponse,
  RegisterRequest,
  SaveBookRequest,
  SaveConfigDataRequest,
  SaveNotesDataRequest,
} from "./generatedTypes";

// адрес API задается переменной окружения
const API_BASE = import.meta.env.VITE_INKLUMIN_API_URL ?? "http://localhost:8080/api";

export const inkLuminAPI = {
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async validateToken(token: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async saveConfigData(
    token: string,
    configData: Record<string, unknown>
  ): Promise<ApiResponse<ConfigDataResponse>> {
    const payload: SaveConfigDataRequest = {
      configData: JSON.stringify(configData),
    };
    const response = await fetch(`${API_BASE}/user/config-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  async getConfigData(token: string): Promise<ApiResponse<ConfigDataResponse>> {
    const response = await fetch(`${API_BASE}/user/config-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async saveNotesData(
    token: string,
    notesData: Record<string, unknown>
  ): Promise<ApiResponse<NotesDataResponse>> {
    const payload: SaveNotesDataRequest = {
      notesData: JSON.stringify(notesData),
    };
    const response = await fetch(`${API_BASE}/user/notes-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  async getNotesData(token: string): Promise<ApiResponse<NotesDataResponse>> {
    const response = await fetch(`${API_BASE}/user/notes-data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async saveBookData(token: string, bookData: SaveBookRequest): Promise<ApiResponse<BookResponse>> {
    const response = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });
    return response.json();
  },

  async getBooksList(token: string): Promise<ApiResponse<BookShortInfo[]>> {
    const response = await fetch(`${API_BASE}/books`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async getBookData(token: string, uuid: string): Promise<ApiResponse<BookResponse>> {
    const response = await fetch(`${API_BASE}/books/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async getTitleForms(token: string, phrase: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE}/ml/title-forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phrase }),
    });
    return response.json();
  },

  async getRepeats(
    token: string,
    text: string,
    windowSize = 10,
    windowSizeTech = 1
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE}/ml/repeats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text,
        window_size: windowSize,
        window_size_tech_words: windowSizeTech,
      }),
    });
    return response.json();
  },

  async getCliches(token: string, text: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE}/ml/cliches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    return response.json();
  },
};
