import React, { useContext, useEffect, useState } from "react";

import PageHeader from "../../../components/common/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Tag from "../../../components/ui/Tag.jsx";
import EmptyState from "../../../components/common/EmptyState.jsx";
import "./../components/coupleProfilePage.css"
import CoupleContext from "../../../context/CoupleContext.jsx";
import useToast from "../../../hooks/useToast.js";
import {
  relationshipAge,
  daysUntil,
  formatDate,
} from "../../../utils/dateUtils.js";

export default function CoupleProfilePage() {
  const {
    couple,
    loading,
    refreshing,
    updateCouple,
    updatePhoto,
    loadCouple,
  } = useContext(CoupleContext);

  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    coupleName: "",
    aboutUs: "",
    startDate: "",
    anniversaryDate: "",
  });

  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // When couple data changes, sync form
  useEffect(() => {
    if (!couple) return;
    setForm({
      coupleName: couple.coupleName || "",
      aboutUs: couple.aboutUs || "",
      startDate: couple.startDate ? couple.startDate.slice(0, 10) : "",
      anniversaryDate: couple.anniversaryDate
        ? couple.anniversaryDate.slice(0, 10)
        : "",
    });
  }, [couple]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coupleName.trim()) {
      toastError("Couple name is required.");
      return;
    }

    setSaving(true);
    const payload = {
      coupleName: form.coupleName.trim(),
      aboutUs: form.aboutUs.trim(),
      startDate: form.startDate || null,
      anniversaryDate: form.anniversaryDate || null,
    };

    const result = await updateCouple(payload);
    setSaving(false);

    if (result.success) {
      success("Couple profile updated 💕");
    } else {
      toastError("Failed to update couple profile.");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    setPhotoUploading(true);
    const result = await updatePhoto(formData);
    setPhotoUploading(false);

    if (result.success) {
      success("Profile photo updated ✨");
    } else {
      toastError("Failed to update photo.");
    }
  };

  // Derived info
  const hasStartDate = !!form.startDate;
  const hasAnniversary = !!form.anniversaryDate;

  let ageInfo = null;
  if (hasStartDate) {
    const age = relationshipAge(form.startDate);
    ageInfo = `${age.years}y ${age.months}m ${age.days}d`;
  }

  let anniversaryInfo = null;
  if (hasAnniversary) {
    const days = daysUntil(form.anniversaryDate);
    if (days < 0) {
      anniversaryInfo = `Anniversary was ${Math.abs(days)} days ago`;
    } else if (days === 0) {
      anniversaryInfo = "Anniversary is today 🎉";
    } else {
      anniversaryInfo = `${days} days until next anniversary`;
    }
  }

  const isLoadingInitial = loading && !couple && !refreshing;

  return (
    <div className="couple-profile-wrapper">
      <PageHeader
        title="Couple Profile"
        subtitle="Set your shared name, story, and special dates for this space."
        actions={
          <Button
            variant="secondary"
            onClick={loadCouple}
            leftIcon="🔄"
          >
            Refresh
          </Button>
        }
      />

      {isLoadingInitial ? (
        <EmptyState
          icon="⏳"
          title="Loading your couple profile..."
          subtitle="Just a moment while we fetch your shared details."
        />
      ) : !couple ? (
        <EmptyState
          icon="💑"
          title="No couple profile yet"
          subtitle="Set up your couple name, story, and special dates to personalize your space."
          actions={
            <Button
              leftIcon="➕"
              onClick={() => setForm((prev) => ({ ...prev }))}
            >
              Start profile
            </Button>
          }
        />
      ) : (
        <div className="couple-profile-grid">
          {/* Left: photo + quick stats */}
          <Card
            title="You two 💕"
            subtitle="Little summary of your journey."
          >
            <div className="couple-profile-left">
              {/* Photo */}
              <div className="couple-photo-wrapper">
                <div className="couple-photo-circle">
                  {couple?.photoUrl ? (
                    <img
                      src={couple.photoUrl}
                      alt="Couple"
                      className="couple-photo-img"
                    />
                  ) : (
                    <span className="couple-photo-emoji">
                      💑
                    </span>
                  )}
                </div>
                <label className="couple-photo-upload-label">
                  {photoUploading ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="couple-photo-upload-input"
                    onChange={handlePhotoChange}
                    disabled={photoUploading}
                  />
                </label>
              </div>

              {/* Name */}
              <div className="couple-name-block">
                <p className="couple-name-label">
                  Couple Name
                </p>
                <p className="couple-name-value">
                  {form.coupleName || "Not set"}
                </p>
              </div>

              {/* Tags */}
              <div className="couple-tags-row">
                {hasStartDate && (
                  <Tag variant="pink" icon="📅">
                    Together for {ageInfo}
                  </Tag>
                )}
                {hasAnniversary && (
                  <Tag variant="success" icon="🎉">
                    {anniversaryInfo}
                  </Tag>
                )}
                {!hasStartDate && !hasAnniversary && (
                  <Tag variant="default" icon="✨">
                    Add dates to see stats
                  </Tag>
                )}
              </div>

              {/* Dates quick view */}
              <div className="couple-dates-block">
                <div className="couple-date-row">
                  <span>Started dating</span>
                  <span className="couple-date-value">
                    {hasStartDate
                      ? formatDate(form.startDate)
                      : "Not set"}
                  </span>
                </div>
                <div className="couple-date-row">
                  <span>Anniversary</span>
                  <span className="couple-date-value">
                    {hasAnniversary
                      ? formatDate(form.anniversaryDate)
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: editable form */}
          <Card
            title="Edit Couple Details"
            subtitle="These details personalize dashboards, timelines, and reminders across the app."
          >
            <form
              onSubmit={handleSubmit}
              className="couple-profile-form"
              noValidate
            >
              <Input
                label="Couple Name"
                icon="💞"
                placeholder="e.g. Avi & Preksha, Chaos & Calm"
                value={form.coupleName}
                onChange={handleChange("coupleName")}
              />

              <Input
                label="About Us"
                textarea
                rows={4}
                icon="📝"
                placeholder="Write a tiny story about you two — how you met, inside jokes, or anything special."
                value={form.aboutUs}
                onChange={handleChange("aboutUs")}
              />

              <div className="couple-form-dates-row">
                <Input
                  label="We started dating on"
                  type="date"
                  icon="📆"
                  value={form.startDate}
                  onChange={handleChange("startDate")}
                />
                <Input
                  label="Anniversary"
                  type="date"
                  icon="🎊"
                  value={form.anniversaryDate}
                  onChange={handleChange("anniversaryDate")}
                />
              </div>

              <div className="couple-form-footer">
                <p className="couple-form-footer-text">
                  These dates help generate countdowns, timeline events,
                  and cute stats on your dashboard.
                </p>
                <Button
                  type="submit"
                  loading={saving || loading}
                  leftIcon="💖"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
