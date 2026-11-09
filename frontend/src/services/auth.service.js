import { api } from './api.js';

export const authService = {
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data.user;
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data.data.user;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async updateProfile(payload) {
    const response = await api.patch('/auth/profile', payload);
    return response.data.data.user;
  },

  async changePassword(payload) {
    const response = await api.patch('/auth/password', payload);
    return response.data;
  },
};
