export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  username: string;
  displayName: string;
  userId: number;
}

export interface SaveBookRequest {
  uuid: string;
  bookTitle: string;
  bookData: string;
  kind?: string;
  form?: string;
  genre?: string;
  cover?: string;
  description?: string;
}

export interface BookResponse {
  uuid: string;
  bookTitle: string;
  bookData: string;
  form?: string;
  genre?: string;
  cover?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookShortInfo {
  uuid: string;
  bookTitle: string;
  form?: string;
  genre?: string;
  cover?: string;
  description?: string;
  kind?: string;
  updatedAt: string;
}

export interface SaveConfigDataRequest {
  configData: string;
}

export interface ConfigDataResponse {
  id: number;
  configData: string;
  createdAt: string;
  updatedAt: string;
}
