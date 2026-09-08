import { ApiResponse, ApiError } from '../types/api.types';
import { CLIENT_MESSAGES } from '../constants/messages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers: customHeaders, ...customConfig } = options;

  let url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('trao_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        statusCode: response.status,
        message: response.statusText || CLIENT_MESSAGES.UNEXPECTED_ERROR,
      };
    }

    if (!response.ok || data.success === false) {
      throw new ApiError(
        data.message || CLIENT_MESSAGES.UNEXPECTED_ERROR,
        data.statusCode || response.status,
        data.errors,
        data.meta
      );
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / unreachable server error
    throw new ApiError(
      CLIENT_MESSAGES.NETWORK_ERROR,
      503
    );
  }
}
