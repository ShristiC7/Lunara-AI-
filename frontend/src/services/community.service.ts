import { api } from './api';

export interface CommunityProfile {
  id: string;
  handle: string;
  createdAt: string;
}

export interface Post {
  id: string;
  profileId: string;
  authorHandle: string;
  content: string;
  symptomSummary: any;
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export const communityService = {
  getProfile: async () => {
    const res = await api.get('/community/profile');
    return res.data.data;
  },

  onboard: async (handle: string) => {
    const res = await api.post('/community/onboard', { handle });
    return res.data.data;
  },

  getPosts: async (page = 1) => {
    const res = await api.get(`/community/posts?page=${page}`);
    return res.data.data;
  },

  getPost: async (id: string) => {
    const res = await api.get(`/community/posts/${id}`);
    return res.data.data;
  },

  createPost: async (content: string, symptomSummary?: any) => {
    const res = await api.post('/community/posts', { content, symptomSummary });
    return res.data.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await api.post(`/community/posts/${postId}/comments`, { content });
    return res.data.data;
  },
};
