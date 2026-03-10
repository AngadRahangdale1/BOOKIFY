import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

function toPreviewPages(bookData) {
  if (Array.isArray(bookData?.previewPages)) {
    // Handles legacy entries where multiple pages were saved in one string.
    return bookData.previewPages
      .flatMap((page) => String(page || "").split(/\r?\n\s*---\s*\r?\n/g))
      .map((page) => page.trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  // Backward compatibility if older records stored plain text.
  const rawText = String(bookData?.previewText || "");
  return rawText
    .split(/\r?\n\s*---\s*\r?\n/g)
    .map((page) => page.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function Reader() {
  const { id } = useParams();
  const firebase = useFirebase();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const fetchedBookIdRef = useRef("");
  const markedReadBookIdRef = useRef("");

  useEffect(() => {
    if (!id) {
      setError("Invalid book id.");
      setLoading(false);
      return;
    }

    if (fetchedBookIdRef.current === id) {
      return;
    }

    fetchedBookIdRef.current = id;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");

        const snapshot = await firebase.getBookById(id);
        if (!snapshot.exists()) {
          throw new Error("Book not found.");
        }

        setBook(snapshot.data());
        setCurrentPage(0);
      } catch (err) {
        console.error("Error loading reader:", err);
        setError(err?.message || "Unable to open reader.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [firebase, id]);

  useEffect(() => {
    if (!id || !firebase?.isLoggedIn) return;

    if (markedReadBookIdRef.current === id) {
      return;
    }

    markedReadBookIdRef.current = id;

    firebase.markBookAsRead(id).catch((err) => {
      console.error("Failed to mark book as read:", err);
    });
  }, [firebase, id]);

  const previewPages = useMemo(() => toPreviewPages(book), [book]);
  const totalPages = previewPages.length;
  const safeIndex = Math.min(Math.max(currentPage, 0), Math.max(totalPages - 1, 0));

  useEffect(() => {
    setCurrentPage((prev) => {
      if (totalPages === 0) return 0;
      return Math.min(prev, totalPages - 1);
    });
  }, [totalPages]);

  if (loading) {
    return <div className="mx-auto mt-8 max-w-5xl px-4 text-slate-700">Opening reader...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-xl font-semibold">Could not open reader</h2>
          <p className="mt-2 text-sm">{error}</p>
          <Link
            to={id ? `/book/browse/${id}` : "/"}
            className="mt-5 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
          <h2 className="text-xl font-semibold">No preview available</h2>
          <p className="mt-2 text-sm">The publisher has not added preview pages for this book yet.</p>
          <Link
            to={id ? `/book/browse/${id}` : "/"}
            className="mt-5 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Back To Book
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-5xl px-4 pb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={id ? `/book/browse/${id}` : "/"}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
        >
          {"<- Back to Book"}
        </Link>

        <p className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
          {book?.name || "Book"} - Page {safeIndex + 1} / {totalPages}
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="min-h-[62vh] rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
          <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-800">
            {previewPages[safeIndex]}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={safeIndex === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={safeIndex >= totalPages - 1}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

export default Reader;
