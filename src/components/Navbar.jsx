import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useFirebase } from '../context/Firebase'; // Add this import

function Navbar() {
  const { isLoggedIn, signOutUser, user, userProfile } = useFirebase(); // Add this line
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      await signOutUser();
    } finally {
      setShowLogoutConfirm(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinkStyles = ({ isActive }) =>
    `transition-all duration-300 font-medium ${
      isActive 
        ? 'text-emerald-600 md:border-b-2 md:border-emerald-600' 
        : 'text-gray-600 hover:text-emerald-500'
    } block py-2 md:py-0 px-4 md:px-0`;

  return (
    <nav className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          
          <Link to='/' className='text-2xl font-bold text-emerald-700 flex items-center gap-2'>
            <div className="bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">B</div>
            <span>Bookify</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-200 p-2 text-emerald-700 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <NavLink to='/' className={navLinkStyles}>Home</NavLink>
            <NavLink to='/about' className={navLinkStyles}>About</NavLink>
           
            {/* Conditional Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-6 border-l border-emerald-100 pl-6">
                <NavLink to='/list' className={navLinkStyles}>My List</NavLink>
                {/* Avatar */}
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden shadow-sm"
                  title="Open profile"
                >
                   {userProfile?.avatarUrl || user?.photoURL ? (
                     <img src={userProfile?.avatarUrl || user?.photoURL} alt="profile" className="h-full w-full object-cover" />
                   ) : (
                     user?.email?.charAt(0).toUpperCase()
                   )}
                </Link>

                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 pl-4">
                <Link to="/login" className="text-gray-600 font-medium hover:text-emerald-600">Login</Link>
                <Link 
                  to='/register' 
                  className='bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-emerald-700 transition-all shadow-md'
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-emerald-100 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              <NavLink to='/' className={navLinkStyles} onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
              <NavLink to='/about' className={navLinkStyles} onClick={() => setMobileMenuOpen(false)}>About</NavLink>

              {isLoggedIn ? (
                <>
                  <NavLink to='/list' className={navLinkStyles} onClick={() => setMobileMenuOpen(false)}>My List</NavLink>
                  <NavLink to='/profile' className={navLinkStyles} onClick={() => setMobileMenuOpen(false)}>Profile</NavLink>

                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="mx-4 mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    onClick={() => setMobileMenuOpen(false)}
                    className='rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white'
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to logout?
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default Navbar;