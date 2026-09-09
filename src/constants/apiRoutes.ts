export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/user/auth/signup',
    LOGIN: '/user/auth/login',
    ME: '/user/auth/me',
    LOGOUT: '/user/auth/logout',
  },
  KIT: {
    BASE: '/kit',
    BY_ID: (id: string) => `/kit/${id}`,
  },
  HEALTH: '/health',
} as const;

