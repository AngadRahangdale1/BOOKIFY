import React, { useCallback, useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";

const GENRE_GROUPS = [
  {
    label: "Popular Genres",
    options: [
      "Adventure",
      "Fantasy",
      "Science Fiction",
      "Mystery",
      "Thriller",
      "Horror",
      "Romance / Love",
      "Drama",
      "Comedy",
      "Action",
    ],
  },
  {
    label: "Thoughtful / Deep Genres",
    options: [
      "Philosophical",
      "Psychological",
      "Inspirational",
      "Self-Help",
      "Historical",
    ],
  },
  {
    label: "Creative / Fun Genres",
    options: ["Fairy Tale", "Mythology", "Superhero", "Dystopian", "Crime"],
  },
  {
    label: "Age-based Genres",
    options: ["Children's Story", "Young Adult"],
  },
];

const MAX_PREVIEW_PAGES = 50;

function parsePreviewPages(rawText, limit) {
  return String(rawText || "")
    .split(/\r?\n\s*---\s*\r?\n/g)
    .map((page) => page.trim())
    .filter(Boolean)
    .slice(0, typeof limit === "number" ? limit : undefined);
}

function FormField({ label, id, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 ml-1 block text-sm font-bold tracking-wide text-slate-900"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function List() {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [ISBNno, setISBNno] = useState("");
  const [genre, setGenre] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [myBooks, setMyBooks] = useState([]);
  const [myBooksLoading, setMyBooksLoading] = useState(true);
  const [myBooksError, setMyBooksError] = useState("");
  const [editingBookId, setEditingBookId] = useState("");
  const [editName, setEditName] = useState("");
  const [editISBNno, setEditISBNno] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editPreviewText, setEditPreviewText] = useState("");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadMyBooks = useCallback(async () => {
    try {
      setMyBooksLoading(true);
      setMyBooksError("");
      const books = await firebase.getMyBooks();
      setMyBooks(books);
    } catch (err) {
      console.error("Failed to load user books:", err);
      setMyBooksError("Could not load your published books.");
    } finally {
      setMyBooksLoading(false);
    }
  }, [firebase]);

  useEffect(() => {
    loadMyBooks();
  }, [loadMyBooks]);

  const uploadImageToCloudinary = async (selectedFile) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "ddlx80coh";
    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "bookify_uploads";

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data },
    );

    const cloudData = await response.json();
    if (!response.ok || !cloudData.secure_url) {
      const cloudError = cloudData?.error?.message || "Cloudinary upload failed.";
      throw new Error(cloudError);
    }

    return cloudData.secure_url;
  };

  // Basic client-side validation for form fields
  const validateListing = ({ name, ISBNno, genre, file, previewText }) => {
    const fieldErrors = {};
    if (!name.trim() || name.trim().length < 3) {
      fieldErrors.name = "Name must be at least 3 characters.";
    }
    if (!ISBNno.trim() || !/^\d{10}(\d{3})?$/.test(ISBNno.trim())) {
      fieldErrors.ISBNno = "ISBN must be 10 or 13 digits.";
    }
    if (!genre) {
      fieldErrors.genre = "Please select a genre.";
    }
    if (!file) {
      fieldErrors.file = "Please upload an image of the book.";
    }

    const previewPages = parsePreviewPages(previewText);
    if (previewText.trim() && previewPages.length === 0) {
      fieldErrors.previewText = "Preview content is invalid. Add text for at least one page.";
    }
    if (previewPages.length > MAX_PREVIEW_PAGES) {
      fieldErrors.previewText = `Preview cannot exceed ${MAX_PREVIEW_PAGES} pages.`;
    }

    return fieldErrors;
  };

  // Handle form submission: upload image to Cloudinary and save metadata to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const formErrors = validateListing({ name, ISBNno, genre, file, previewText });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
  
    const previewPages = parsePreviewPages(previewText, MAX_PREVIEW_PAGES);

    setUploading(true);

    try {
      const imageUrl = await uploadImageToCloudinary(file);

      const docRef = await firebase.handleCreateNewListing(
        name.trim(),
        ISBNno.trim(),
        0,
        imageUrl,
        genre,
        previewPages,
      );

      console.log("Book created:", {
        docId: docRef.id,
        imageUrl,
      });
      alert("Book added to Bookify!");
      clearForm();
      await loadMyBooks();
    } catch (err) {
      console.error("Create listing failed:", err);
      setSubmitError(
        err?.message || "Failed to create listing. Check console for details.",
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl("");
    }

    setFile(selected);
  };

  const clearForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setName("");
    setISBNno("");
    setGenre("");
    setPreviewText("");
    setFile(null);
    setPreviewUrl("");
    setErrors({});
    setSubmitError("");
  };

  const startEditingBook = (book) => {
    setEditingBookId(book.id);
    setEditName(book.name || "");
    setEditISBNno(book.ISBNno || "");
    setEditGenre(book.genre || "");
    setEditPreviewText(Array.isArray(book.previewPages) ? book.previewPages.join("\n---\n") : "");
    setEditCoverFile(null);
  };

  const cancelEditingBook = () => {
    setEditingBookId("");
    setEditName("");
    setEditISBNno("");
    setEditGenre("");
    setEditPreviewText("");
    setEditCoverFile(null);
  };

  const saveEditedBook = async (bookId) => {
    try {
      setSavingEdit(true);
      const updatePayload = {
        name: editName,
        ISBNno: editISBNno,
        genre: editGenre,
        previewPages: parsePreviewPages(editPreviewText, MAX_PREVIEW_PAGES),
      };

      if (editCoverFile) {
        updatePayload.imageUrl = await uploadImageToCloudinary(editCoverFile);
      }

      await firebase.updateBookListing(bookId, updatePayload);
      alert("Book updated.");
      cancelEditingBook();
      await loadMyBooks();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err?.message || "Could not update this book.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    const confirmed = window.confirm("Delete this book permanently?");
    if (!confirmed) return;

    try {
      await firebase.deleteBookListing(bookId);
      if (editingBookId === bookId) {
        cancelEditingBook();
      }
      await loadMyBooks();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.message || "Could not delete this book.");
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100"
      style={{ fontFamily: "Poppins, Segoe UI, Tahoma, sans-serif" }}
    >
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-7 shadow-[0_24px_70px_rgba(2,6,23,0.6)] backdrop-blur-sm">
          <p className="inline-block rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Seller Studio
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Publish Your Next
            <span className="text-amber-300"> Bestseller</span>
          </h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Craft a trusted listing with complete details, accurate pricing, and a clean cover shot.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
              <p className="mt-2 text-lg font-semibold text-cyan-200">
                {uploading ? "Uploading" : "Ready"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ISBN</p>
              <p className="mt-2 truncate text-lg font-semibold text-white">
                {ISBNno || "Not entered"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Live cover preview</p>
            <div className="mt-3 flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-600 bg-slate-800">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected book cover preview"
                  className="h-56 w-full object-cover"
                />
              ) : (
                <p className="px-6 text-center text-sm text-slate-400">
                  Upload a cover image to see preview here.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-300/20 bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.35)] sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Book Details</h2>
          <p className="mt-1 text-sm text-slate-600">Fill all required fields to publish your listing.</p>

          {submitError ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <FormField label="Book Name" id="name" error={errors.name}>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Atomic Habits"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={uploading}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </FormField>

            <FormField
              label="ISBN Number"
              id="isbnNo"
              error={errors.ISBNno}
              hint="Must be 10 or 13 digits"
            >
              <input
                type="text"
                id="isbnNo"
                name="isbnNo"
                placeholder="9780307465351"
                value={ISBNno}
                onChange={(e) => setISBNno(e.target.value.replace(/\s+/g, ""))}
                disabled={uploading}
                inputMode="numeric"
                aria-invalid={Boolean(errors.ISBNno)}
                aria-describedby={errors.ISBNno ? "isbnNo-error" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </FormField>

            <FormField label="Genre" id="genre" error={errors.genre}>
              <select
                id="genre"
                name="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={uploading}
                aria-invalid={Boolean(errors.genre)}
                aria-describedby={errors.genre ? "genre-error" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Select a genre</option>
                {GENRE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            <FormField
              label={`Read Preview Content (max ${MAX_PREVIEW_PAGES} pages)`}
              id="previewText"
              error={errors.previewText}
              hint="Use a new page separator like: --- (three dashes) on a new line between pages."
            >
              <textarea
                id="previewText"
                name="previewText"
                rows={8}
                placeholder="Page 1 text...\n---\nPage 2 text..."
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                disabled={uploading}
                aria-invalid={Boolean(errors.previewText)}
                aria-describedby={errors.previewText ? "previewText-error" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
              <p className="mt-2 text-xs text-slate-500">
                Pages detected: {parsePreviewPages(previewText).length}/{MAX_PREVIEW_PAGES}
              </p>
            </FormField>

            <FormField label="Cover Image" id="file" error={errors.file}>
              <input
                type="file"
                id="file"
                name="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                aria-invalid={Boolean(errors.file)}
                aria-describedby={errors.file ? "file-error" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
              />
              {file ? <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p> : null}
            </FormField>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading ? "Publishing..." : "Publish Listing"}
              </button>
              <button
                type="button"
                onClick={clearForm}
                disabled={uploading}
                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={uploading}
                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="relative mx-auto mt-8 w-full max-w-6xl rounded-3xl border border-slate-700/70 bg-slate-900/85 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-white">My Published Books</h3>
            <p className="mt-1 text-sm text-slate-300">
              Edit or delete books you created.
            </p>
          </div>
          <p className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
            {myBooks.length} books
          </p>
        </div>

        {myBooksLoading ? <p className="mt-4 text-slate-300">Loading your books...</p> : null}
        {myBooksError ? <p className="mt-4 text-red-300">{myBooksError}</p> : null}

        {!myBooksLoading && !myBooksError && myBooks.length === 0 ? (
          <p className="mt-4 text-slate-300">No books published yet.</p>
        ) : null}

        {!myBooksLoading && !myBooksError && myBooks.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myBooks.map((book) => (
              <article key={book.id} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.name} className="h-40 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-700 text-sm text-slate-300">
                    No cover image
                  </div>
                )}

                <h4 className="mt-3 text-lg font-semibold text-white">{book.name}</h4>
                <p className="text-xs text-slate-300">ISBN: {book.ISBNno}</p>
                <p className="text-xs text-slate-300">Genre: {book.genre || "General"}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditingBook(book)}
                    className="w-full rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBook(book.id)}
                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/book/read/${book.id}`)}
                  className="mt-2 w-full rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                >
                  Read
                </button>

                {editingBookId === book.id ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Book name"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={editISBNno}
                      onChange={(e) => setEditISBNno(e.target.value)}
                      placeholder="ISBN"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <select
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="">Select genre</option>
                      {GENRE_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <textarea
                      rows={5}
                      value={editPreviewText}
                      onChange={(e) => setEditPreviewText(e.target.value)}
                      placeholder="Page 1\n---\nPage 2"
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-200"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => saveEditedBook(book.id)}
                        className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={cancelEditingBook}
                        className="w-full rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default List;
