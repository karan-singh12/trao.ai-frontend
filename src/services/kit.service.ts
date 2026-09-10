import { apiClient } from './apiClient';
import { API_ROUTES } from '../constants/apiRoutes';
import { PrepKit, Question } from '../data/sampleKit';

export interface GenerateKitPayload {
  jd: string;
  company_url: string;
  days: number;
  company_name?: string;
  location?: string;
}

export interface RegenerateSectionPayload {
  section: 'company_brief' | 'category' | 'schedule';
  category?: string;
  days?: number;
}

export const KitService = {
  async getKits(): Promise<PrepKit[]> {
    const res = await apiClient<PrepKit[]>(API_ROUTES.KIT.BASE, {
      method: 'GET',
    });
    return res.data || [];
  },

  async getKitById(id: string): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(API_ROUTES.KIT.BY_ID(id), {
      method: 'GET',
    });
    if (!res.data) {
      throw new Error(res.message || 'Kit not found');
    }
    return res.data;
  },

  async createKit(kitData: Partial<PrepKit>): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(API_ROUTES.KIT.BASE, {
      method: 'POST',
      body: JSON.stringify(kitData),
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to create kit');
    }
    return res.data;
  },

  async generateKit(payload: GenerateKitPayload): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(API_ROUTES.KIT.GENERATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to generate prep kit');
    }
    return res.data;
  },

  async generateKitStream(
    payload: GenerateKitPayload,
    onProgress: (stage: string, message: string) => void
  ): Promise<PrepKit> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('trao_token') : null;
    const url = `${API_BASE_URL.replace(/\/$/, '')}${API_ROUTES.KIT.GENERATE_STREAM}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errMsg = 'Generation failed';
      try {
        const errJson = await response.json();
        errMsg = errJson.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    if (!response.body) {
      throw new Error('Streaming not supported in this browser environment');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalKit: PrepKit | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        if (!block.trim()) continue;
        const eventMatch = block.match(/^event:\s*(\w+)/m);
        const dataMatch = block.match(/^data:\s*(.+)$/m);
        const eventName = eventMatch ? eventMatch[1] : 'message';
        const rawData = dataMatch ? dataMatch[1] : '';

        if (!rawData) continue;

        try {
          const parsed = JSON.parse(rawData);
          if (eventName === 'progress') {
            onProgress(parsed.stage, parsed.message);
          } else if (eventName === 'done') {
            finalKit = parsed.kit;
          } else if (eventName === 'error') {
            throw new Error(parsed.message || 'Error occurred during pipeline run');
          }
        } catch (e: any) {
          if (eventName === 'error') throw e;
        }
      }
    }

    if (!finalKit) {
      throw new Error('Pipeline completed without returning a prep kit');
    }

    return finalKit;
  },

  async regenerateSection(
    kitId: string,
    payload: RegenerateSectionPayload
  ): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(API_ROUTES.KIT.REGENERATE(kitId), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to regenerate section');
    }
    return res.data;
  },

  async updateKit(id: string, kitData: Partial<PrepKit>): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(API_ROUTES.KIT.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(kitData),
    });
    if (!res.data) {
      throw new Error(res.message || 'Failed to update kit');
    }
    return res.data;
  },

  async deleteKit(id: string): Promise<void> {
    await apiClient(API_ROUTES.KIT.BY_ID(id), {
      method: 'DELETE',
    });
  },

  async updateQuestion(
    kitId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(
      API_ROUTES.KIT.QUESTION(kitId, questionId),
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
    if (!res.data) {
      throw new Error(res.message || 'Failed to update question');
    }
    return res.data;
  },

  async deleteQuestion(kitId: string, questionId: string): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(
      API_ROUTES.KIT.QUESTION(kitId, questionId),
      {
        method: 'DELETE',
      }
    );
    if (!res.data) {
      throw new Error(res.message || 'Failed to delete question');
    }
    return res.data;
  },

  async recordConfidence(
    kitId: string,
    cardId: string,
    confidence: 'none' | 'somewhat' | 'confident'
  ): Promise<PrepKit> {
    const res = await apiClient<PrepKit>(
      API_ROUTES.KIT.FLASHCARD_CONFIDENCE(kitId, cardId),
      {
        method: 'POST',
        body: JSON.stringify({ confidence }),
      }
    );
    if (!res.data) {
      throw new Error(res.message || 'Failed to record confidence');
    }
    return res.data;
  },
};
