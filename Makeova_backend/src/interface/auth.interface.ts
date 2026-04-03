
export interface IUserLogin {
  email: string;
  password: string;
}


export interface ITokenPayload {
  token: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}


export interface IJwtDecoded {
  userId: string;
  iat: number;
  exp: number;
}
