import React, { useState } from "react";
import { FaGift, FaEnvelope, FaMusic, FaGlassCheers, FaLock, FaCheckCircle, FaTrash, FaPlus } from "react-icons/fa";

const TYPE_ICONS = {
  letter: { icon: FaEnvelope, label: "Love Letter", color: "text-purple-500 bg-purple-500/10" },
  flowers: { icon: FaGift, label: "Flowers & Treat", color: "text-pink-500 bg-pink-500/10" },
  gift: { icon: FaGift, label: "Surprise Gift", color: "text-emerald-500 bg-emerald-500/10" },
  date: { icon: FaGlassCheers, label: "Special Date", color: "text-amber-500 bg-amber-500/10" },
  playlist: { icon: FaMusic, label: "Comfort Playlist", color: "text-blue-500 bg-blue-500/10" },
  other: { icon: FaGift, label: "Special Surprise", color: "text-rose-500 bg-rose-500/10" },
};

export default function SurprisePlanner({ surprises = [], isFemale, onCreateSurprise, onDeleteSurprise }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("gift");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    await onCreateSurprise({ title, type, content });
    setTitle("");
    setContent("");
    setType("gift");
    setIsSubmitting(false);
    setShowModal(false);
  };

  const hiddenDrafts = surprises.filter((s) => !s.isRevealed);
  const revealedSurprises = surprises.filter((s) => s.isRevealed);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-rose-500/15 border border-purple-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span>🎁 Male Only Surprise Planner</span>
            {isFemale ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-600 font-semibold">
                Revealed Gifts Wall
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 font-semibold">
                Secret Drafts Planner
              </span>
            )}
          </h2>
          <p className="text-xs text-secondary max-w-xl">
            {isFemale
              ? "Surprises prepared by your partner are automatically unlocked whenever you confirm your period! 💖"
              : "Plan hidden sweet gestures, letters, gifts, or playlists for your partner. She will NOT see drafts until she confirms her period! 🤫"}
          </p>
        </div>

        {!isFemale && (
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus /> Create Secret Surprise
          </button>
        )}
      </div>

      {/* Male Partner Drafts Section */}
      {!isFemale && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <FaLock className="text-purple-500" /> Hidden Drafts ({hiddenDrafts.length})
          </h3>

          {hiddenDrafts.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-theme rounded-2xl text-secondary space-y-2">
              <div className="text-3xl">🤫</div>
              <p className="text-sm font-semibold">No secret surprises planned yet.</p>
              <p className="text-xs">Click "Create Secret Surprise" to plan a sweet gesture for your partner!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hiddenDrafts.map((surprise) => {
                const typeInfo = TYPE_ICONS[surprise.type] || TYPE_ICONS.other;
                const IconComponent = typeInfo.icon;
                return (
                  <div
                    key={surprise._id}
                    className="bg-surface border border-purple-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl text-lg ${typeInfo.color}`}>
                          <IconComponent />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-primary">{surprise.title}</h4>
                          <span className="text-[11px] text-secondary">{typeInfo.label}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSurprise(surprise._id)}
                        className="text-secondary hover:text-red-500 p-1 transition-colors"
                        title="Delete surprise draft"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>

                    {surprise.content && (
                      <p className="text-xs text-secondary bg-surface-subtle p-3 rounded-xl border border-theme">
                        "{surprise.content}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-purple-600 font-semibold pt-1 border-t border-theme">
                      <span className="flex items-center gap-1">
                        <FaLock className="text-[10px]" /> Hidden from girlfriend
                      </span>
                      <span>Unlocks on Period Confirm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Revealed Surprises Section (Both Partners) */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-base text-primary flex items-center gap-2">
          <FaCheckCircle className="text-pink-500" /> Revealed Surprises ({revealedSurprises.length})
        </h3>

        {revealedSurprises.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-theme rounded-2xl text-secondary space-y-2">
            <div className="text-3xl">🌸</div>
            <p className="text-sm font-semibold">No revealed surprises yet.</p>
            <p className="text-xs">
              When period start date is confirmed, hidden surprises will unlock right here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {revealedSurprises.map((surprise) => {
              const typeInfo = TYPE_ICONS[surprise.type] || TYPE_ICONS.other;
              const IconComponent = typeInfo.icon;
              return (
                <div
                  key={surprise._id}
                  className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl text-xl ${typeInfo.color}`}>
                      <IconComponent />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-primary">{surprise.title}</h4>
                      <span className="text-xs text-pink-600 font-semibold">
                        Revealed on {new Date(surprise.revealedAt || surprise.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {surprise.content && (
                    <p className="text-xs text-primary bg-surface/80 p-3 rounded-xl border border-pink-500/20 italic">
                      "{surprise.content}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-theme rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-primary">Create Secret Surprise 🎁</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Surprise Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Favorite Chocolate & Hot Tea Package"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-purple-500 text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Surprise Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-purple-500 text-primary"
                >
                  <option value="gift">🎁 Surprise Gift</option>
                  <option value="flowers">💐 Flowers & Treats</option>
                  <option value="letter">💌 Love Letter</option>
                  <option value="date">🥂 Cozy Date Plan</option>
                  <option value="playlist">🎵 Comfort Playlist</option>
                  <option value="other">✨ Special Surprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Details / Note (Hidden until revealed)
                </label>
                <textarea
                  rows="3"
                  placeholder="Write a sweet message or secret details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-theme bg-surface-subtle focus:outline-none focus:border-purple-500 text-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded-xl border border-theme text-secondary hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                >
                  Save Secret Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
