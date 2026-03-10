import React, { useEffect, useState } from "react";
import { useFirebase } from "../context/Firebase";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const firebase = useFirebase();
    const navigate = useNavigate();

    const displayName =
        firebase?.user?.displayName || firebase?.user?.email?.split("@")[0] || "Reader";

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const snapshot = await firebase.getAllBooks();
                const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setBooks(items);
            } catch (err) {
                console.error("Failed to fetch books:", err);
                setError("Could not load books. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [firebase]);

    if (loading) {
        return (
            <div className="mx-auto mt-6 max-w-6xl px-4 text-slate-700">Loading books...</div>
        );
    }

    if (error) {
        return <div className="mx-auto mt-6 max-w-6xl px-4 text-red-600">{error}</div>;
    }

    const handleGetStarted = () => {
        if (!firebase.isLoggedIn) {
            navigate("/login");
            return;
        }

        navigate("/list");
    };

    const click = (book) => {
        if (!firebase.isLoggedIn) {
            navigate("/login");
            return;
        }

        navigate(`/book/browse/${book.id}`);
    };

    const loopBooks = books.length > 0 ? [...books, ...books] : [];
    const marqueeDuration = Math.max(18, books.length * 3);

    return (
        <div className="mx-auto mt-6 max-w-[1450px] px-4 pb-8">
            <section className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
                <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />

                <div className="relative grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Bookify Home</p>
                        <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Welcome {displayName}
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
                            Find quality books faster with a curated shelf and a smooth, secure browse experience.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleGetStarted}
                                disabled={firebase.authLoading}
                                className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-emerald-400"
                            >
                                {firebase.isLoggedIn ? "Get Started" : "Login To Get Started"}
                            </button>

                            {!firebase.isLoggedIn ? (
                                <Link
                                    to="/login"
                                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                                >
                                    Login
                                </Link>
                            ) : null}
                        </div>

                        <p className="mt-3 text-xs font-medium text-slate-600 sm:text-sm">
                            {firebase.isLoggedIn
                                ? "Access granted: you can browse details and open your List page."
                                : "Please login first. Guests cannot browse books or open the List page."}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Snapshot</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Available books</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-800">{books.length}</p>
                            </div>
                            <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                                <p className="text-xs uppercase tracking-[0.12em] text-cyan-700">Account status</p>
                                <p className="mt-1 text-lg font-bold text-cyan-800">
                                    {firebase.isLoggedIn ? "Logged In" : "Guest"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Live Shelf</p>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Featured Books</h2>
                </div>
                <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {books.length} listed
                </p>
            </div>

            {books.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                    <p className="text-sm">No books listed yet. Add one from the List page.</p>
                </div>
            ) : (
                <div className="relative overflow-hidden py-3">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

                    <div
                        className="flex w-max gap-4 px-4 will-change-transform animate-[bookMarquee_30s_linear_infinite] hover:[animation-play-state:paused]"
                        style={{ animationDuration: `${marqueeDuration}s` }}
                    >
                        {loopBooks.map((book, index) => (
                            <article
                                key={`${book.id}-${index}`}
                                className="group w-56 shrink-0 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-64 lg:w-72"
                            >
                                {book.imageUrl ? (
                                    <img
                                        src={book.imageUrl}
                                        alt={book.name}
                                        className="mb-3 h-40 w-full rounded-xl object-cover ring-1 ring-slate-100 transition duration-300 group-hover:ring-emerald-200 sm:h-44"
                                    />
                                ) : (
                                    <div className="mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500 sm:h-44">
                                        No image
                                    </div>
                                )}

                                <h3 className="line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">{book.name}</h3>
                                <p className="line-clamp-1 text-xs text-slate-500">ISBN: {book.ISBNno}</p>
                                <p className="mt-1 inline-block rounded-full border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                                    {book.genre || "General"}
                                </p>
                                <p className="mt-1 text-base font-bold text-emerald-700">Rs. {book.price}</p>

                                <button
                                    onClick={() => click(book)}
                                    disabled={!firebase.isLoggedIn}
                                    className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {firebase.isLoggedIn ? "Browse" : "Login To Browse"}
                                </button>

                                {firebase.isLoggedIn ? (
                                    <button
                                        onClick={() => navigate(`/book/read/${book.id}`)}
                                        className="mt-2 w-full rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                                    >
                                        Read
                                    </button>
                                ) : null}
                            </article>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bookMarquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-[bookMarquee_30s_linear_infinite] {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;
