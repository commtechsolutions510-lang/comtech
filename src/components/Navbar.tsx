import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { company } from '../data/company';

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'About', to: '/about' },
  { name: 'Products', to: '/products' },
  { name: 'Services', to: '/services' },
  { name: 'Locations', to: '/locations' },
  { name: 'Contact', to: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md bg-[#0B1F3A]/95 backdrop-blur-sm' : 'bg-[#0B1F3A] shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center min-w-0">
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Commtech<span className="text-[#1677FF]">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-[#1677FF]'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#1677FF] rounded-lg hover:bg-[#0f6ae7] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </a>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/products"
              aria-label="View products"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-white/90 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#1677FF]"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden bg-[#0B1F3A] border-t border-white/10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-white/5 text-[#1677FF]'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3">
                <a
                  href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}`}
                  className="block w-full text-center px-5 py-3 text-base font-semibold text-white bg-[#1677FF] rounded-lg hover:bg-[#0f6ae7] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
