import axiosClient from "./axiosClient";

const memoryApi = {
  createMemory: (payload) => axiosClient.post("/memories", payload, payload instanceof FormData ? {} : undefined),
  uploadPhotosToAlbum: (albumId, payload) => axiosClient.post(`/memories/albums/${albumId}/photos`, payload, payload instanceof FormData ? {} : undefined),
  getMemories: (params = {}) => axiosClient.get("/memories", { params }),
  getMemoryById: (id) => axiosClient.get(`/memories/${id}`),
  updateMemory: (id, payload) => axiosClient.put(`/memories/${id}`, payload, payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined),
  deleteMemory: (id) => axiosClient.delete(`/memories/${id}`),
  toggleFavorite: (id) => axiosClient.patch(`/memories/${id}/favourite`),
  restoreMemory: (id) => axiosClient.post(`/memories/restore/${id}`),
  deleteForever: (id) => axiosClient.delete(`/memories/permanent/${id}`),
  getFolders: () => axiosClient.get("/memories/folders"),
  getAlbums: () => axiosClient.get("/memories/albums"),
  getAlbumPhotos: (albumId, params = {}) => axiosClient.get(`/memories/albums/${albumId}/photos`, { params }),
  createAlbum: (payload) => axiosClient.post("/memories/albums", payload),
  updateAlbum: (id, payload) => axiosClient.patch(`/memories/albums/${id}`, payload),
  createAlbumDeleteRequest: (id) => axiosClient.post(`/memories/albums/${id}/delete-request`),
  getAlbumDeleteRequests: () => axiosClient.get(`/memories/albums/delete-requests`),
  approveAlbumDeleteRequest: (id) => axiosClient.patch(`/memories/albums/delete-request/${id}/approve`),
  rejectAlbumDeleteRequest: (id) => axiosClient.patch(`/memories/albums/delete-request/${id}/reject`),
  deleteAlbum: (id) => axiosClient.delete(`/memories/albums/${id}`),
  getFavorites: () => axiosClient.get("/memories/favorites"),
  getDeleted: () => axiosClient.get("/memories/deleted"),
  getStats: () => axiosClient.get("/memories/stats"),
  getTimeline: () => axiosClient.get("/memories/timeline"),
  getOnThisDay: () => axiosClient.get("/memories/on-this-day"),
};

export default memoryApi;
