export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  is_google_account?: boolean;
  picture?: string;
  fecha_registro?: Date;
  ultima_conexion?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  is_google_account?: boolean;
}

export interface LoginResponse {
  success: boolean;
  mensaje: string;
  token: string;
  usuario: Usuario;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'usuario';
  is_google_account?: boolean;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  mensaje?: string;
  data?: any;
  error?: string;
  errores?: [];
}