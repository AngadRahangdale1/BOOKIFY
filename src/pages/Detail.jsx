import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const firebase = useFirebase();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await firebase.getBookById(id);

        if (!snapshot.exists()) {
          setError("Book not found.");
          setData(null);
          return;
        }

        setData(snapshot.data());
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Unable to load this book right now.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    } else {
      setError("Invalid book id.");
      setLoading(false);
    }
  }, [firebase, id]);

  const placeOrder = async () => {
    try {
      if (!id) {
        throw new Error("Invalid book id.");
      }

      const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
      const result = await firebase.placeOrder(id, safeQty);
      console.log("Order placed successfully", result);
      alert("Order placed successfully.");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert(err?.message || "Could not place order right now.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-52 rounded bg-slate-200" />
          <div className="mt-4 h-72 rounded-xl bg-slate-200" />
          <div className="mt-5 h-4 w-72 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-44 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-xl font-semibold">Could not open book</h2>
          <p className="mt-2 text-sm">{error}</p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = data?.imageUrl || null;
  const previewPages = Array.isArray(data?.previewPages) ? data.previewPages.slice(0, 50) : [];

  const openReader = () => {
    if (previewPages.length === 0) {
      alert("No read preview provided by publisher.");
      return;
    }

    navigate(`/book/read/${id}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          {"<- Back to listings"}
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={data?.name || "Book cover"}
                className="h-full min-h-[320px] w-full object-cover"
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center bg-slate-100 px-6 text-center text-slate-500">
                No cover image uploaded for this listing.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Book Profile
            </p>

            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {data?.name || "Untitled Book"}
            </h1>

            <p className="mt-3 inline-block rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700">
              {data?.genre || "General"}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">ISBN</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {data?.ISBNno || "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Price</p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">
                  {data?.price ? `Rs. ${data.price}` : "Not available"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Listed by</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {data?.userEmail || "Unknown seller"}
              </p>
            </div>

            <div className="mt-2 rounded-xl">
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                className="border border-slate-300 bg-slate-50 p-2 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
              />
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              Purchase Now
            </button>

            <button
              type="button"
              onClick={openReader}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-100"
            >
              Read
            </button>

            <p className="mt-2 text-xs text-slate-500">
              Preview pages available: {previewPages.length}/50
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Detail;
