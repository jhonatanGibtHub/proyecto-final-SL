
export interface JwtPayload {
  sub: string;
  roles: string;
  picture: string;
  exp: number;
  iat?: number;
  iss?: string;
}
