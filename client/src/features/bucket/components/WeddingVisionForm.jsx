import React, { useRef, useState } from "react";
import bucketApi from "../../../api/bucketApi";
import { showErrorToast, showSuccessToast } from "../../../utils/swalTheme";
import { useTheme } from "../../../hooks/useTheme";
import "./Bucket.css";

export default function WeddingVisionForm({ onAdd }) {
  const theme = useTheme();
  const [type, setType] = useState("location");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Please choose an image smaller than 5MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please add a title for your wedding vision item.");
      return;
    }
    if (!imageFile) {
      setError("Please upload an image from your device.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const uploadRes = await bucketApi.uploadVisionImage(formData);
      const imageUrl = uploadRes.data?.data?.imageUrl || uploadRes.data?.imageUrl;
      if (!imageUrl) {
        throw new Error("Upload failed. Please try again.");
      }

      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        referenceLink: referenceLink.trim() || null,
      };

      const createRes = await bucketApi.addVisionItem(payload);
      const item = createRes.data?.data || createRes.data;
      onAdd?.(item);
      showSuccessToast(theme, { title: "Wedding vision added!", timer: 2200, position: "top-end" });

      setType("location");
      setTitle("");
      setDescription("");
      setReferenceLink("");
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Wedding vision create failed", err);
      showErrorToast(theme, { title: "Upload failed", text: err?.response?.data?.message || err?.message || "Try again." });
      setError(err?.response?.data?.message || err?.message || "Unable to add wedding vision item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bk-card">
      <div className="bk-header">
        <span className="bk-badge">Wedding Vision</span>
        <p className="bk-subtitle">
          Pin your dream decor, dresses, locations and playlists. 💍
        </p>
      </div>

      <form className="bk-form" onSubmit={handleSubmit}>
        <div className="bk-row">
          <div className="bk-field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="location">Location</option>
              <option value="dress">Dress / Outfit</option>
              <option value="decor">Decor</option>
              <option value="playlist">Playlist / Song</option>
              <option value="idea">Idea / Vibe</option>
            </select>
          </div>

          <div className="bk-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Beach sunset mandap, pastel lehenga…"
              required
            />
          </div>
        </div>

        <div className="bk-field">
          <label>Description (optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Colors, mood, details you both imagine…"
          />
        </div>

        <div
          className="bk-upload-dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') handleBrowseClick(); }}
        >
          {preview ? (
            <img src={preview} alt="Wedding vision preview" className="bk-upload-preview" />
          ) : (
            <>
              <p>Drag & drop an image here, or click to browse</p>
              <small>Accepted: JPG, PNG, WEBP up to 5MB.</small>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="bk-upload-input"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            hidden
          />
        </div>

        <div className="bk-field">
          <label>Reference link (optional)</label>
          <input
            type="url"
            value={referenceLink}
            onChange={(e) => setReferenceLink(e.target.value)}
            placeholder="Song link, venue page, vendor reference…"
          />
        </div>

        {error && <p className="bk-upload-error">{error}</p>}

        <button type="submit" className="bk-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading…' : 'Add to wedding vision'}
        </button>
      </form>
    </div>
  );
}
