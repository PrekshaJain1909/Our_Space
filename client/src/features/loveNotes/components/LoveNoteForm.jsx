import React, { useState } from "react";

export default function LoveNoteForm({ onAdd, femaleName, maleName, isAuthenticated }) {

  const [form, setForm] = useState({
    from: "female",
    to: "male",
    title: "",
    content: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.content) return;

    onAdd({
      ...form,
      createdAt: new Date()
    });

    setForm({ from: "female", to: "male", title: "", content: "" });
  };

  if (!isAuthenticated)
    return <div className="ln-card">Login to add notes</div>;

  return (
    <div className="ln-card">

      <div className="ln-header">
        <div className="ln-badge">Add Love Note</div>
        <div className="ln-subtitle">
          Write a little note of love to re-read on sad days 💖
        </div>
      </div>

      <form className="ln-form" onSubmit={handleSubmit}>

        <div className="ln-form-row">

          <div className="ln-field">
            <label>From</label>
            <select
              value={form.from}
              onChange={(e) =>
                setForm({ ...form, from: e.target.value })
              }
            >
              <option value="female">{femaleName}</option>
              <option value="male">{maleName}</option>
            </select>
          </div>

          <div className="ln-field">
            <label>To</label>
            <select
              value={form.to}
              onChange={(e) =>
                setForm({ ...form, to: e.target.value })
              }
            >
              <option value="female">{femaleName}</option>
              <option value="male">{maleName}</option>
            </select>
          </div>

        </div>

        <div className="ln-field">
          <input
            placeholder="e.g. Reasons I love you..."
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        <div className="ln-field">
          <textarea
            rows="4"
            placeholder="Write your heart out…"
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
          />
        </div>

        <button className="ln-primary-btn">Save Love Note</button>

      </form>
    </div>
  );
}