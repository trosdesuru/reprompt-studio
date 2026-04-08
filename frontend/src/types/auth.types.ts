export interface UserLogin {
  username: string;
  email?: string,
  password?: string;
}

export interface UserRegister {
  email?: string;
  password?: string;
  [key: string]: any;
}