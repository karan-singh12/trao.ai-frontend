export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginPayload) => Promise<AuthResponseData>;
  signup: (credentials: SignupPayload) => Promise<AuthResponseData>;
  logout: () => void;
}
