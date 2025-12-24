export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  fecha_registro?: Date;
  ultima_conexion?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
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
}

export interface AuthResponse {
  success: boolean;
  mensaje?: string;
  data?: any;
  error?: string;
}
export interface GoogleUserData {
  email: string;
  picture: string;
  name: string;
}
export interface GoogleRegistroRequest {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'usuario';
  picture?: string;
}
export interface GoogleRegistroResponse {
  success: boolean;
  mensaje?: string;
  data?: any;
  error?: string;
}
export interface GoogleLoginRequest {
  idToken: string;
}