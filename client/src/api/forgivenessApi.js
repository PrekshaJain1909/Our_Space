import axiosClient from './axiosClient';

export default {
  createForgiveness: (payload) => axiosClient.post('/forgiveness', payload),
  getForgiveness: (params) => axiosClient.get('/forgiveness', { params }),
  getStats: () => axiosClient.get('/forgiveness/stats'),
  markDone: (id) => axiosClient.patch(`/forgiveness/${id}/done`),
};
