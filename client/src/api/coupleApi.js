import axiosClient from "./axiosClient";

const coupleApi = {
  // Create couple profile (after signup or when they first finish onboarding)
  createCouple: (payload) =>
    axiosClient.post("/couple", payload),
  // payload example:
  // { coupleName, startDate, anniversaryDate, photoUrl? }

  // Get current couple info (for dashboard, navbar, landing)
  getCouple: () =>
    axiosClient.get("/couple"),

  // Update couple general info (name, description, etc.)
  updateCouple: (payload) =>
    axiosClient.put("/couple", payload),
  // payload example:
  // { coupleName?, aboutUs?, anniversaryDate?, startDate? }

  // Upload/update couple display photo
  updatePhoto: (photoFormData) =>
    axiosClient.put("/couple/photo", photoFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update single field (handy!)
  updateField: (field, value) =>
    axiosClient.patch("/couple", { field, value }),
  // example:
  // updateField("coupleName", "H & V Forever")

  // Delete couple (optional — depends on backend)
  deleteCouple: () =>
    axiosClient.delete("/couple"),
};

export default coupleApi;
