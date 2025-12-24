
export interface JwtPayload {
  sub: string;
  roles: string;       // Aún es string (ej: "ROLE_USER ROLE_ADMIN")
  picture: string;
  exp: number;         // <-- ahora obligatorio
  iat?: number;
  iss?: string;
}
