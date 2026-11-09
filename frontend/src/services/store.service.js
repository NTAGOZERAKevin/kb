import { api } from './api.js';

export const productService = {
  async list(params = {}) {
    const response = await api.get('/products', { params });
    return response.data.data;
  },

  async get(identifier) {
    const response = await api.get(`/products/${identifier}`);
    return response.data.data.product;
  },

  async reviews(productId) {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data.data.reviews;
  },

  async addReview(productId, payload) {
    const response = await api.post(`/products/${productId}/reviews`, payload);
    return response.data.data;
  },

  async create(payload) {
    const response = await api.post('/products', payload);
    return response.data.data.product;
  },

  async update(id, payload) {
    const response = await api.patch(`/products/${id}`, payload);
    return response.data.data.product;
  },

  async remove(id) {
    await api.delete(`/products/${id}`);
  },
};

export const orderService = {
  async create(payload) {
    const response = await api.post('/orders', payload);
    return response.data.data.order;
  },

  async myOrders() {
    const response = await api.get('/orders/my');
    return response.data.data.orders;
  },

  async adminList(params = {}) {
    const response = await api.get('/orders/admin/all', { params });
    return response.data.data;
  },

  async updateStatus(id, status, note) {
    const response = await api.patch(`/orders/admin/${id}/status`, { status, note });
    return response.data.data.order;
  },

  async pay(id) {
    const response = await api.post(`/orders/${id}/pay`);
    return response.data.data;
  },

  async confirmPayment(id) {
    const response = await api.patch(`/orders/admin/${id}/confirm-payment`);
    return response.data.data.order;
  },
};

export const uploadService = {
  async image(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/uploads/image', formData);
    return response.data.data;
  },
};

export const notificationService = {
  async list(limit = 10) {
    const response = await api.get('/notifications', { params: { limit } });
    return response.data.data;
  },

  async markRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};

export const customerService = {
  async list(params = {}) {
    const response = await api.get('/customers', { params });
    return response.data.data;
  },

  async get(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },

  async setActive(id, isActive) {
    const response = await api.patch(`/customers/${id}`, { isActive });
    return response.data.data.customer;
  },
};

export const dashboardService = {
  async get() {
    const response = await api.get('/dashboard');
    return response.data.data;
  },
};
