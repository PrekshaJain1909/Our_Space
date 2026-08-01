import axiosClient from "./axiosClient";

const bucketApi = {
  /* --------------------------- BUCKET LIST --------------------------- */

  // Create a new bucket list item
  addBucketItem: (payload) =>
    axiosClient.post("/bucket", payload),
  /*
    payload example:
    {
      title,
      description?,
      category?,        // "travel" | "food" | "experience" | ...
      targetDate?,      // "2025-12-31"
      status?,          // "pending" | "in-progress" | "done"
    }
  */

  // Get all bucket list items
  getBucketItems: (params = {}) =>
    axiosClient.get("/bucket", { params }),

  // Get single bucket item by id
  getBucketItem: (id) => axiosClient.get(`/bucket/${id}`),
  /*
    params example (optional):
    { status: "pending" } or { category: "travel" }
  */

  // Update a bucket list item
  updateBucketItem: (id, payload) =>
    axiosClient.put(`/bucket/${id}`, payload),

  // Mark bucket item as done
  completeBucketItem: (id) =>
    axiosClient.patch(`/bucket/${id}/complete`),

  // Restore a bucket item (uncomplete)
  restoreBucketItem: (id) =>
    axiosClient.patch(`/bucket/${id}/restore`),

  // Delete a bucket list item
  deleteBucketItem: (id) =>
    axiosClient.delete(`/bucket/${id}`),

  // Bucket list stats (for progress widget)
  getBucketStats: () =>
    axiosClient.get("/bucket/stats"),
  /*
    Suggested backend response:
    {
      total: 12,
      pending: 6,
      inProgress: 3,
      done: 3,
      completionRate: 25 // %
    }
  */


  /* ----------------------- WEDDING VISION BOARD ---------------------- */

  // Add new wedding vision item (dress, decor, location, playlist, etc.)
  addVisionItem: (payload) =>
    axiosClient.post("/wedding-vision", payload),
  /*
    payload example:
    {
      type: "dress" | "decor" | "location" | "playlist" | "other",
      title,
      description?,
      referenceLink?,    // pinterest, instagram, etc.
      image            // full uploaded image URL from /wedding-vision/upload
    }
  */

  // Get all wedding vision items
  getVisionItems: (params = {}) =>
    axiosClient.get("/wedding-vision", { params }),
  /*
    params example (optional):
    { type: "dress" }
  */

  // Update a wedding vision item
  updateVisionItem: (id, payload) =>
    axiosClient.put(`/wedding-vision/${id}`, payload),

  // Delete a wedding vision item
  deleteVisionItem: (id) =>
    axiosClient.delete(`/wedding-vision/${id}`),

  // Optional: upload image for vision board (if backend supports file upload)
  uploadVisionImage: (formData) =>
    axiosClient.post("/wedding-vision/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default bucketApi;
