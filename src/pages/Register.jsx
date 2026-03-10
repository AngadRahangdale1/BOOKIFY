import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';

function Register() {
  const firebase = useFirebase();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!firebase.authLoading && firebase.isLoggedIn) {
      navigate('/');
    }
  }, [firebase.authLoading, firebase.isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      await firebase.signupUserWithEmailAndPassword(email, password);
      setSuccessMessage('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white px-4 py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16),0_8px_18px_rgba(15,23,42,0.08)] md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-emerald-700 tracking-tight">Create Account</h1>
            <p className="text-slate-600 mt-2">Join our professional community</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-pulse">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_22px_rgba(15,23,42,0.08)]">
            <div>
              <label className="block text-sm font-bold tracking-wide text-slate-900 mb-1 ml-1">Full Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none shadow-[0_10px_18px_rgba(15,23,42,0.08)] transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wide text-slate-900 mb-1 ml-1">Email Address</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none shadow-[0_10px_18px_rgba(15,23,42,0.08)] transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wide text-slate-900 mb-1 ml-1">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none shadow-[0_10px_18px_rgba(15,23,42,0.08)] transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform transition-all active:scale-95 mt-4"
            >
              Register Now
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:underline transition-all">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;