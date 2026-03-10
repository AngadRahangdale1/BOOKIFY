import React, { useEffect, useMemo, useState } from "react";
import { useFirebase } from "../context/Firebase";

function formatJoinedDate(user, userProfile) {
  const profileDate = userProfile?.createdAt;
  if (profileDate?.seconds) {
    return new Date(profileDate.seconds * 1000).toLocaleDateString();
  }
  if (profileDate instanceof Date) {
    return profileDate.toLocaleDateString();
  }

  const authDate = user?.metadata?.creationTime;
  if (authDate) {
    return new Date(authDate).toLocaleDateString();
  }

  return "Not available";
}

function Profile() {
  const firebase = useFirebase();
  const { user, userProfile } = firebase;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [myBooksCount, setMyBooksCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "");
    setBio(userProfile?.bio || "");
  }, [user, userProfile]);

  useEffect(() => {
    const loadMyBooks = async () => {
      try {
        setLoadingBooks(true);
        const items = await firebase.getMyBooks();
        setMyBooksCount(items.length);
      } catch (err) {
        console.error("Failed to load user books:", err);
      } finally {
        setLoadingBooks(false);
      }
    };

    loadMyBooks();
  }, [firebase]);

  const booksReadCount = useMemo(() => {
    if (!Array.isArray(userProfile?.readBookIds)) return 0;
    return userProfile.readBookIds.length;
  }, [userProfile]);

  const joinedDate = useMemo(() => formatJoinedDate(user, userProfile), [user, userProfile]);

  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setError("");
      setSaving(true);

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "ddlx80coh";
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "bookify_uploads";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const payload = await response.json();
      if (!response.ok || !payload.secure_url) {
        throw new Error(payload?.error?.message || "Failed to upload avatar.");
      }

      await firebase.updateCurrentUserProfile({ avatarUrl: payload.secure_url });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError(err?.message || "Could not upload avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setSaving(true);
      await firebase.updateCurrentUserProfile({ name, bio });
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = userProfile?.avatarUrl || user?.photoURL || "";

  return (
    <div className="mx-auto mt-6 max-w-5xl px-4 pb-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your account info and reading stats.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-600 text-4xl font-bold text-white shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                (name || user?.email || "U").charAt(0).toUpperCase()
              )}
            </div>

            <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Upload Avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>

            <p className="mt-3 text-xs text-slate-500">JPG, PNG and WEBP supported.</p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700"
              />
            </div>

            <div>
              <label htmlFor="bio" className="mb-1 block text-sm font-semibold text-slate-700">Bio</label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Books Read</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{booksReadCount}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Books Created</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingBooks ? "..." : myBooksCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Date Joined</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{joinedDate}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Reader Handle</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              @{(name || "reader").toLowerCase().replace(/\s+/g, "_")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
