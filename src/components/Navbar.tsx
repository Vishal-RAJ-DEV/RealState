import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Menu, X, Home, Heart, User } from 'lucide-react';
import { useApp } from '@/store/PropertyContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, logout } = useApp();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = scrolled
    ? 'bg-surface-glass/95 backdrop-blur-md shadow-subtle'
    : isHome
      ? 'bg-transparent'
      : 'bg-cream/95 backdrop-blur-md';

  const textColor = !scrolled && isHome ? 'text-cream' : 'text-charcoal';

  const navLinks = [
    { label: 'Buy', to: '/search?type=Buy' },
    { label: 'Rent', to: '/search?type=Rent' },
    { label: 'Sell', to: '/post' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className={`font-serif text-xl lg:text-2xl font-semibold ${textColor} tracking-tight`}>
              PropFinder
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium ${textColor} hover:opacity-70 transition-opacity`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {state.isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium ${textColor} hover:opacity-70 transition-opacity`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className={`text-sm font-medium ${textColor} hover:opacity-70 transition-opacity`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className={`text-sm font-medium ${textColor} hover:opacity-70 transition-opacity`}
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/post"
                className="bg-crimson text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-crimson/90 transition-colors"
              >
                Post Property
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 ${textColor}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-charcoal pt-20"
          >
            <div className="flex flex-col items-center gap-6 pt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-cream text-2xl font-serif hover:text-crimson transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-16 h-px bg-cream/20 my-4" />
              {state.isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-cream text-2xl font-serif hover:text-crimson transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-cream text-2xl font-serif hover:text-crimson transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-cream text-2xl font-serif hover:text-crimson transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/post"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 bg-crimson text-white px-8 py-3 rounded font-medium"
              >
                Post Property
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-t border-border-subtle lg:hidden">
        <div className="flex items-center justify-around h-16">
          <Link to="/" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/' ? 'text-crimson' : 'text-charcoal/50'}`}>
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/search" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/search' ? 'text-crimson' : 'text-charcoal/50'}`}>
            <Search size={20} />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link to="/post" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/post' ? 'text-crimson' : 'text-charcoal/50'}`}>
            <Plus size={20} />
            <span className="text-[10px] font-medium">Post</span>
          </Link>
          <Link to="/saved" className={`flex flex-col items-center gap-0.5 ${location.pathname === '/saved' ? 'text-crimson' : 'text-charcoal/50'}`}>
            <Heart size={20} />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>
          <Link to={state.isAuthenticated ? '/dashboard' : '/auth'} className={`flex flex-col items-center gap-0.5 ${location.pathname === '/dashboard' || location.pathname === '/auth' ? 'text-crimson' : 'text-charcoal/50'}`}>
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </>
  );
}
