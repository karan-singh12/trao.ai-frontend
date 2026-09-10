export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/user/auth/signup',
    LOGIN: '/user/auth/login',
    ME: '/user/auth/me',
    LOGOUT: '/user/auth/logout',
  },
  KIT: {
    BASE: '/kit',
    GENERATE: '/kit/generate',
    GENERATE_STREAM: '/kit/generate/stream',
    BY_ID: (id: string) => `/kit/${id}`,
    REGENERATE: (id: string) => `/kit/${id}/regenerate`,
    QUESTION: (id: string, questionId: string) => `/kit/${id}/question/${questionId}`,
    FLASHCARD_CONFIDENCE: (id: string, cardId: string) => `/kit/${id}/flashcard/${cardId}/confidence`,
  },
  HEALTH: '/health',
} as const;
