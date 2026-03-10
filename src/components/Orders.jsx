import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/Firebase";


function Orders() {
    const firebase = useFirebase();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await firebase.fetchMyOrders();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                setError("Could not load your orders right now.");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [firebase]);

    if (loading) {
        return <div className="mx-auto mt-6 max-w-5xl px-4 text-slate-700">Loading orders...</div>;
    }

    if (error) {
        return <div className="mx-auto mt-6 max-w-5xl px-4 text-red-600">{error}</div>;
    }

  return (
        <div className="mx-auto mt-6 max-w-5xl px-4">
            <h1 className="mb-4 text-2xl font-bold text-slate-900">My Orders</h1>
            {orders.length === 0 ? (
                <p className="text-slate-600">You have not placed any orders yet.</p>
            ) : (
                <ul className="space-y-3">
                    {orders.map((order) => (
                        <li
                            key={order.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                            <p className="text-sm text-slate-600">Order ID: {order.id}</p>
                            <p className="text-sm text-slate-600">Book ID: {order.bookId || "N/A"}</p>
                            <p className="text-sm font-medium text-slate-800">Quantity: {order.qty || 1}</p>
                        </li>
                    ))}
                </ul>
            )}
    </div>
    );
}

export default Orders;
