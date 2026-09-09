import { apiClient } from './apiClient';
import { API_ROUTES } from '../constants/apiRoutes';
import { PrepKit, Question } from '../data/sampleKit';

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
      `${API_ROUTES.KIT.BY_ID(kitId)}/question/${questionId}`,
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
      `${API_ROUTES.KIT.BY_ID(kitId)}/question/${questionId}`,
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
      `${API_ROUTES.KIT.BY_ID(kitId)}/flashcard/${cardId}/confidence`,
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
