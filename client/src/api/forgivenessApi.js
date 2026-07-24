import axiosClient from './axiosClient';

export default {
  createForgiveness: (payload) => axiosClient.post('/forgiveness', payload),
  getForgiveness: (params) => axiosClient.get('/forgiveness', { params }),
  getStats: () => axiosClient.get('/forgiveness/stats'),
  acceptForgiveness: (id) => axiosClient.patch(`/forgiveness/${id}/accept`),
  rejectForgiveness: (id) => axiosClient.patch(`/forgiveness/${id}/reject`),
  deleteForgiveness: (id) => axiosClient.delete(`/forgiveness/${id}`),
  markDone: (id) => axiosClient.patch(`/forgiveness/${id}/done`),
};
