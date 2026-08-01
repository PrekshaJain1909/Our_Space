import axiosClient from './axiosClient';

export default {
  // fetch available punishments for wheel
  getPunishments: (params) => axiosClient.get('/punishments', { params }),

  // add a new punishment
  addPunishment: (payload) => axiosClient.post('/punishments', payload),

  // delete a punishment by id
  deletePunishment: (id) => axiosClient.delete(`/punishments/${id}`),

  // spin (get random punishment)
  spinPunishment: (params) => axiosClient.get('/punishments/spin', { params }),

  // save selected/generated punishment to history
  saveGeneratedPunishment: (payload) => axiosClient.post('/punishments/generated', payload),
};

