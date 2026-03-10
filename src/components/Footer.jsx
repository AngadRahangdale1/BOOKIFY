import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.6.4-1 1-1Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: 'https://x.com/',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M5 5h3.3l3.3 4.7L15.7 5H19l-5.7 7.2L19.5 19h-3.3l-3.8-5.3L8.2 19H5l6-7.5L5 5Z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-white border-t border-emerald-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Responsive Grid: 1 column on mobile (default), 3 columns on desktop (md:) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <Link to='/' className='text-2xl font-bold text-emerald-700 flex items-center gap-2'>
              <div className="bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">B</div>
              <span>Bookify</span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              Your personal digital library. Organize, discover, and share your favorite reads in one beautiful place.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-emerald-800 font-bold mb-5 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Bookify</Link></li>
              <li><Link to="/list" className="hover:text-emerald-600 transition-colors">List a Book</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Newsletter */}
          <div>
            <h4 className="text-emerald-800 font-bold mb-5 uppercase tracking-wider text-xs">Stay Connected</h4>
            <p className="text-sm text-slate-600 mb-4">Join our community of book lovers.</p>
            <div className="mb-4 space-y-1 text-sm text-slate-600">
              <p>
                Contact:{' '}
                <a
                  href="mailto:angadkumaar82@gmail.com"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  angadkumaar82@gmail.com
                </a>
              </p>
              <p>Location: Jalandhar, India</p>
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-emerald-50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} Bookify. Crafted with Emerald Green.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer border-b border-slate-300 pb-0.5 hover:border-emerald-600 hover:text-emerald-600">
              Privacy Policy
            </span>
            <span className="cursor-pointer border-b border-slate-300 pb-0.5 hover:border-emerald-600 hover:text-emerald-600">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
