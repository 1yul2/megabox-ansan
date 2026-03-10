export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  is_system: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LogOutResponseDTO {
  message: string;
}
