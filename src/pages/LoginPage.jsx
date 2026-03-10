import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';
import { useEffect } from 'react';

function LoginPage() {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const {isLoggedIn,authLoading} = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect (()=>{ // Redirect to home if already logged in
    if(!authLoading && isLoggedIn){
      navigate('/');
    }
  },[isLoggedIn,authLoading,navigate])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await firebase.loginUserWithEmailAndPassword(email, password);
      setSuccessMessage('User logged in successfully. Redirecting...');
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
        return;
      }
      setError(error.message || 'Something went wrong while logging in.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage('');

    try {
      await firebase.signInWithGoogle();
      setSuccessMessage('User logged in successfully. Redirecting...');
      navigate('/');
    } catch (error) {
      setError(error.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white px-4 py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16),0_8px_18px_rgba(15,23,42,0.08)] md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-emerald-700 tracking-tight">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-pulse text-center">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_22px_rgba(15,23,42,0.08)]">
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
              Sign In
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-300"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/0 px-2 text-slate-500 font-semibold backdrop-blur-sm">Or continue with</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/02/20/google_logo.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline transition-all">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

