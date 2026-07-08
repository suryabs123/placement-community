import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Avatar from "./Avatar";

function Navbar() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home",  },
    { to: "/ask", label: "Ask" },
    { to: "/myquestions", label: "My Questions", },
    { to: "/publicchat", label: "Chat" },
    { to: "/chat", label: "Private" },
    { to: "/notifications", label: "Alerts" },
    { to: "/profile", label: "Profile"},
    { to: "/support", label: "Support"},
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? "py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl" 
          : "py-3 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group flex-shrink-0 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <img 
                  src="/logoo.png" 
                  alt="College Logo" 
                  className="w-full h-full object-contain animate-logo"
                />
              </div>
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="text-sm lg:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                CIT Community
              </span>
            </div>
            <div className="sm:hidden block">
              <span className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                CIT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1 border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap relative ${
                  isActive(link.to)
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10 scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span className="text-sm transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {!currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 whitespace-nowrap animate-gradient"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 transition-all duration-300 hover:scale-105">
                  <Avatar 
                    user={{ id: currentUser.uid, name: currentUser.displayName }}
                    size="w-7 h-7"
                    textSize="text-xs"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:block">
                    {currentUser.displayName?.split(" ")[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:rotate-12"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 relative">
                <span className={`absolute block h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-1'
                } w-full`}></span>
                <span className={`absolute block h-0.5 bg-current transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                } top-1/2 -translate-y-1/2 w-full`}></span>
                <span className={`absolute block h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'bottom-1'
                } w-full`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Updated: Removed ChitChat LIVE & Duplicate Sign In/Get Started */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? "max-h-[700px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"
        }`}
      >
        <div className={`mx-3 mt-2 p-4 rounded-2xl backdrop-blur-2xl border shadow-2xl ${
          darkMode 
            ? "bg-slate-900/95 border-slate-700/50 shadow-slate-900/50" 
            : "bg-white/95 border-slate-200/50 shadow-xl"
        }`}>
          {/* User Profile Header in Mobile Menu */}
          {currentUser && (
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {currentUser.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white truncate">
                  {currentUser.displayName || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.to)
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800/50 hover:scale-[1.02]"
                }`}
                style={{
                  animation: mobileMenuOpen ? `slideIn 0.3s ease-out ${index * 50}ms both` : 'none'
                }}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {isActive(link.to) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                )}
              </Link>
            ))}
            
            {/* 🔥 REMOVED: ChitChat LIVE section - completely deleted */}
            {/* 🔥 REMOVED: Duplicate Sign In & Get Started buttons - they're already in the top navbar */}

            {!currentUser ? (
              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                  👋 Welcome! Sign in to access all features
                </p>
                {/* Sign In & Get Started removed from here - they're in the top navbar */}
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-500 border-2 border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;