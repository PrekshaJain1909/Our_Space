import React, { useEffect, useRef, useState } from "react";
import { CloudUpload, HeartHandshake, Sparkles, X } from "lucide-react";
import "../MemoryBox.css";

const supportedImageTypes = /^image\/(jpeg|png|webp)$/i;
const supportedImageExtensions = /\.(jpe?g|png|webp)$/i;

export default function MemoryUploadForm({
  onAddMemories,
  onEditMemory,
  editingMemory,
  onCancelEdit,
  onClose,
  albums = [],
  defaultAlbumId = "",
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("happy");
  const [location, setLocation] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [createdBy, setCreatedBy] = useState("Preksha Jain");
  const [selectedAlbumId, setSelectedAlbumId] = useState(defaultAlbumId || "");
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [queue, setQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const fileInputRef = useRef(null);
  const queueRef = useRef([]);

  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title || "");
      setDate(editingMemory.date || new Date().toISOString().slice(0, 10));
      setDescription(editingMemory.description || "");
      setMood(editingMemory.mood || "happy");
      setLocation(editingMemory.location || "");
      setTagsInput((editingMemory.tags || []).join(", "));
      setCreatedBy(editingMemory.createdBy || "Preksha Jain");
      setSelectedAlbumId(editingMemory.albumId || defaultAlbumId || "");
      setIsFavorite(Boolean(editingMemory.isFavorite));
    } else {
      setSelectedAlbumId(defaultAlbumId || "");
      setIsFavorite(false);
    }
  }, [defaultAlbumId, editingMemory]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setTagsInput("");
    setCreatedBy("Preksha Jain");
    setSelectedAlbumId(defaultAlbumId || "");
    setDate(new Date().toISOString().slice(0, 10));
    setMood("happy");
    setIsFavorite(false);
    setUploadError("");
    setIsUploading(false);
    setQueue([]);
  };

  const isSupportedImageFile = (file) => {
    const typeMatches = supportedImageTypes.test(file.type || "");
    const extensionMatches = supportedImageExtensions.test(file.name || "");
    return typeMatches || extensionMatches;
  };

  const handleSelection = (files) => {
    if (!files?.length) return;

    const validFiles = Array.from(files).filter(isSupportedImageFile);
    if (!validFiles.length) {
      setUploadError("Please choose JPG, JPEG, PNG, or WebP images.");
      return;
    }

    const nextItems = validFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "queued",
      error: "",
      isCover: !queueRef.current.length && index === 0,
    }));

    setQueue((prev) => [...prev, ...nextItems]);
    setUploadError("");
  };

  const handleFileChange = (event) => {
    handleSelection(event.target.files);
    event.target.value = "";
  };

  const handleRemoveItem = (itemId) => {
    setQueue((prev) => {
      const removedItem = prev.find((item) => item.id === itemId);
      if (removedItem?.previewUrl) URL.revokeObjectURL(removedItem.previewUrl);
      const nextQueue = prev.filter((item) => item.id !== itemId);
      if (!nextQueue.some((item) => item.isCover)) {
        nextQueue[0] && (nextQueue[0].isCover = true);
      }
      return nextQueue;
    });
  };

  const handleSetCover = (itemId) => {
    setQueue((prev) => prev.map((item) => ({ ...item, isCover: item.id === itemId })));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingMemory) {
      if (!title.trim()) return;
      setIsUploading(true);
      try {
        await onEditMemory({
          ...editingMemory,
          title: title.trim(),
          date,
          description: description.trim(),
          mood,
          location: location.trim(),
          albumId: selectedAlbumId || editingMemory.albumId,
          createdBy,
          tags: tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          isFavorite,
        });
        onCancelEdit && onCancelEdit();
        onClose && onClose();
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!queue.length) {
      setUploadError("Pick at least one photo to add to the album.");
      return;
    }

    if (!selectedAlbumId) {
      setUploadError("Choose an album before uploading photos.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setQueue((prev) => prev.map((item) => ({ ...item, progress: 25, status: "uploading" })));

    try {
      await onAddMemories(queue.map((item) => item.file), {
        albumId: selectedAlbumId,
        createdBy,
        isFavorite,
      });
      setQueue((prev) => prev.map((item) => ({ ...item, progress: 100, status: "uploaded" })));
      resetForm();
      onClose && onClose();
    } catch (error) {
      setUploadError("The upload could not be completed. Please try again.");
      setQueue((prev) => prev.map((item) => ({ ...item, progress: 0, status: "error", error: "Upload failed" })));
    } finally {
      setIsUploading(false);
    }
  };

  if (editingMemory) {
    return (
      <div className="memory-upload-shell">
        <div className="memory-upload-header">
          <div className="memory-upload-title">
            <p className="memory-section-tag">✏️ Edit Memory</p>
            <h2>Refine the details for this photo</h2>
            <p>Add the title, story and mood once the upload is already in place.</p>
          </div>
          <div className="memory-badge">
            <HeartHandshake size={14} /> Save with love
          </div>
        </div>

        <form className="memory-upload-form" onSubmit={handleSubmit}>
          <div className="memory-upload-grid">
            <div className="memory-upload-field">
              <label>Title</label>
              <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A tiny title" required />
            </div>
            <div className="memory-upload-field">
              <label>Date</label>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </div>

          <div className="memory-upload-grid">
            <div className="memory-upload-field">
              <label>Location</label>
              <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Where did this happen?" />
            </div>
            <div className="memory-upload-field">
              <label>Mood</label>
              <select value={mood} onChange={(event) => setMood(event.target.value)}>
                <option value="happy">Happy</option>
                <option value="romantic">Romantic</option>
                <option value="calm">Calm</option>
                <option value="emotional">Emotional</option>
              </select>
            </div>
          </div>

          <div className="memory-upload-field">
            <label>Description</label>
            <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell the little story behind the photo" />
          </div>

          <div className="memory-upload-grid">
            <div className="memory-upload-field">
              <label>Created by</label>
              <select value={createdBy} onChange={(event) => setCreatedBy(event.target.value)}>
                <option value="Preksha Jain">Preksha Jain</option>
                <option value="Abhishek Dubey">Abhishek Dubey</option>
              </select>
            </div>
            <div className="memory-upload-field">
              <label>Tags</label>
              <input type="text" value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="sunset, chai, lake" />
            </div>
          </div>

          <div className="memory-upload-grid">
            <div className="memory-upload-field">
              <label>Album</label>
              <select value={selectedAlbumId} onChange={(event) => setSelectedAlbumId(event.target.value)}>
                <option value="">No album selected</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            </div>
            <div className="memory-upload-field">
              <label>Favorite</label>
              <button type="button" className={`memory-pill-toggle ${isFavorite ? "is-active" : ""}`} onClick={() => setIsFavorite((value) => !value)}>
                {isFavorite ? "❤️ Added to favorites" : "♡ Add to favorites"}
              </button>
            </div>
          </div>

          {uploadError ? <p className="memory-upload-error">{uploadError}</p> : null}
          <div className="memory-upload-actions">
            <button type="button" className="memory-secondary-btn" onClick={() => { onCancelEdit && onCancelEdit(); onClose && onClose(); }}>
              Cancel
            </button>
            <button type="submit" className="memory-submit-btn" disabled={isUploading}>
              <Sparkles size={15} /> Save changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="memory-upload-shell">
      <div className="memory-upload-header">
        <div className="memory-upload-title">
          <p className="memory-section-tag">📸 Add Photos</p>
          <h2>Upload first, edit later</h2>
          <p>Pick your photos, preview them instantly and send them straight to the album.</p>
        </div>
        <div className="memory-badge">
          <HeartHandshake size={14} /> Google Photos style
        </div>
      </div>

      <div className="memory-upload-body">
        <div
          className={`memory-upload-preview ${dragActive ? "memory-upload-preview-drag" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            handleSelection(event.dataTransfer?.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.jpg,.jpeg,.png,.webp"
            hidden
            onChange={handleFileChange}
          />
          <div className="memory-upload-preview-inner">
            {queue.length ? (
              <div className="memory-upload-preview-grid">
                {queue.map((item) => (
                  <img key={item.id} src={item.previewUrl} alt={item.file.name} />
                ))}
              </div>
            ) : (
              <div className="memory-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <CloudUpload size={24} />
                <span>Select Photos</span>
                <small>Drag and drop images here or choose files from your device</small>
              </div>
            )}
          </div>
        </div>

        <form className="memory-upload-form" onSubmit={handleSubmit}>
          <div className="memory-upload-grid">
            <div className="memory-upload-field">
              <label>Album</label>
              <select value={selectedAlbumId} onChange={(event) => setSelectedAlbumId(event.target.value)}>
                <option value="">Pick an album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            </div>
            <div className="memory-upload-field">
              <label>Favorite</label>
              <button type="button" className={`memory-pill-toggle ${isFavorite ? "is-active" : ""}`} onClick={() => setIsFavorite((value) => !value)}>
                {isFavorite ? "❤️ Added to favorites" : "♡ Add to favorites"}
              </button>
            </div>
          </div>

          <div className="memory-upload-toolbar">
            <button type="button" className="memory-secondary-btn" onClick={() => fileInputRef.current?.click()}>
              <CloudUpload size={15} /> Select Photos
            </button>
            <button type="submit" className="memory-submit-btn" disabled={isUploading || !queue.length}>
              <Sparkles size={15} /> Upload
            </button>
          </div>

          {uploadError ? <p className="memory-upload-error">{uploadError}</p> : null}

          {queue.length ? (
            <div className="memory-upload-queue">
              {queue.map((item) => (
                <div key={item.id} className="memory-upload-queue-item">
                  <img src={item.previewUrl} alt={item.file.name} className="memory-upload-queue-thumb" />
                  <div className="memory-upload-queue-body">
                    <div className="memory-upload-queue-title-row">
                      <div>
                        <p className="memory-upload-queue-name">{item.file.name}</p>
                        <p className="memory-upload-queue-size">{Math.round(item.file.size / 1024)} KB</p>
                      </div>
                      <button type="button" className="memory-upload-remove" onClick={() => handleRemoveItem(item.id)}>
                        <X size={14} />
                      </button>
                    </div>

                    <div className="memory-upload-progress-track">
                      <div className="memory-upload-progress-fill" style={{ width: `${item.progress}%` }} />
                    </div>

                    <div className="memory-upload-queue-actions">
                      <button type="button" className={`memory-upload-chip ${item.isCover ? "is-selected" : ""}`} onClick={() => handleSetCover(item.id)}>
                        {item.isCover ? "📌 Cover photo" : "Set cover"}
                      </button>
                      <span className="memory-upload-status">{item.status || "Queued"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="memory-upload-empty">
              <p>No photos selected yet.</p>
              <span>Click 'Select Photos' or drag images here.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
