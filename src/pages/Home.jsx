import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { darkMode } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [stats, setStats] = useState({ total: 0, today: 0 });

  useEffect(() => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(data);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQuestions = data.filter(q => {
        const date = q.createdAt?.toDate();
        return date && date >= today;
      });
      setStats({
        total: data.length,
        today: todayQuestions.length,
      });
    });
    return () => unsubscribe();
  }, []);

  const getUniqueMonths = () => {
    const months = new Set();
    questions.forEach(q => {
      const date = q.createdAt?.toDate();
      if (date) {
        const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
        months.add(monthYear);
      }
    });
    return Array.from(months).sort((a, b) => {
      const [aMonth, aYear] = a.split('-').map(Number);
      const [bMonth, bYear] = b.split('-').map(Number);
      if (aYear !== bYear) return bYear - aYear;
      return bMonth - aMonth;
    });
  };

  const getUniqueYears = () => {
    const years = new Set();
    questions.forEach(q => {
      const date = q.createdAt?.toDate();
      if (date) {
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getSortedQuestions = () => {
    let filtered = [...questions];

    if (search) {
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedMonth) {
      const [month, year] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(q => {
        const date = q.createdAt?.toDate();
        return date && date.getMonth() === month && date.getFullYear() === year;
      });
    }

    if (selectedYear) {
      filtered = filtered.filter(q => {
        const date = q.createdAt?.toDate();
        return date && date.getFullYear() === Number(selectedYear);
      });
    }

    switch(sortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        break;
      case "oldest":
        filtered.sort((a, b) => a.createdAt?.toDate() - b.createdAt?.toDate());
        break;
      case "year":
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.toDate();
          const bDate = b.createdAt?.toDate();
          if (!aDate || !bDate) return 0;
          return bDate.getFullYear() - aDate.getFullYear();
        });
        break;
      case "month":
        filtered.sort((a, b) => {
          const aDate = a.createdAt?.toDate();
          const bDate = b.createdAt?.toDate();
          if (!aDate || !bDate) return 0;
          return (bDate.getFullYear() * 12 + bDate.getMonth()) - 
                 (aDate.getFullYear() * 12 + aDate.getMonth());
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredQuestions = getSortedQuestions();
  const uniqueMonths = getUniqueMonths();
  const uniqueYears = getUniqueYears();

  const getMonthName = (monthYear) => {
    const [month, year] = monthYear.split('-').map(Number);
    return new Date(year, month).toLocaleString('default', { month: 'long' }) + ' ' + year;
  };

  return (
    <div className={`min-h-screen pt-24 ${
      darkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 logo-hover">
              <img 
                src="/logoo.png" 
                alt="College Logo" 
                className="w-full h-full object-contain animate-logo"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {stats.total} questions posted
          </div>
          <h1 className={`text-5xl sm:text-6xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}>
            CIT Placement <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Community</span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}>
            Ask questions, share knowledge and help fellow students ace their placements.
          </p>
          {!currentUser && (
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/register" className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
                🚀 Get Started
              </Link>
              <Link to="/login" className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                darkMode 
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800" 
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}>
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search previous questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700 focus:border-indigo-500 text-white placeholder:text-slate-500"
                  : "bg-white/80 border-slate-200 focus:border-indigo-500 shadow-lg"
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                darkMode
                  ? "bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500"
                  : "bg-white/80 border-slate-200 text-slate-700 focus:border-indigo-500 shadow-sm"
              }`}
            >
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
              <option value="year">📆 Sort by Year</option>
              <option value="month">📆 Sort by Month</option>
            </select>

            {uniqueYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth("");
                }}
                className={`px-4 py-2.5 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                  darkMode
                    ? "bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500"
                    : "bg-white/80 border-slate-200 text-slate-700 focus:border-indigo-500 shadow-sm"
                }`}
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {uniqueMonths.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                  darkMode
                    ? "bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500"
                    : "bg-white/80 border-slate-200 text-slate-700 focus:border-indigo-500 shadow-sm"
                }`}
              >
                <option value="">All Months</option>
                {uniqueMonths.map(monthYear => (
                  <option key={monthYear} value={monthYear}>
                    {getMonthName(monthYear)}
                  </option>
                ))}
              </select>
            )}

            {(selectedYear || selectedMonth || sortBy !== "newest") && (
              <button
                onClick={() => {
                  setSelectedYear("");
                  setSelectedMonth("");
                  setSortBy("newest");
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
              >
                ✕ Clear Filters
              </button>
            )}
          </div>

          {(selectedYear || selectedMonth) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Active filters:</span>
              {selectedYear && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  Year: {selectedYear}
                </span>
              )}
              {selectedMonth && (
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  {getMonthName(selectedMonth)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className={`p-4 rounded-2xl text-center ${
            darkMode ? "bg-slate-800/50" : "bg-white/80 shadow-sm"
          }`}>
            <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
            <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Questions</div>
          </div>
          <div className={`p-4 rounded-2xl text-center ${
            darkMode ? "bg-slate-800/50" : "bg-white/80 shadow-sm"
          }`}>
            <div className="text-2xl font-bold text-rose-500">{stats.today}</div>
            <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Asked Today</div>
          </div>
          <div className={`p-4 rounded-2xl text-center ${
            darkMode ? "bg-slate-800/50" : "bg-white/80 shadow-sm"
          }`}>
            <div className="text-2xl font-bold text-cyan-500">{questions.reduce((acc, q) => acc + (q.upvotes || 0), 0)}</div>
            <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Upvotes</div>
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className={`p-12 rounded-3xl text-center ${
            darkMode ? "bg-slate-800/50" : "bg-white/80 shadow-sm"
          }`}>
            <div className="text-6xl mb-4">🔍</div>
            <h2 className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-slate-800"
            }`}>
              No matching posts found
            </h2>
            <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Try adjusting your filters or ask a new question.
            </p>
            <Link to="/ask" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
              ❓ Ask a Question
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:scale-[1.01] ${
                  darkMode
                    ? "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
                    : "bg-white shadow-sm hover:shadow-xl border border-slate-100"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        👍 {question.upvotes || 0}
                      </span>
                      {question.createdAt?.toDate() > new Date(Date.now() - 24*60*60*1000) && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                          New
                        </span>
                      )}
                      {question.createdAt?.toDate() && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {question.createdAt.toDate().toLocaleString('default', { month: 'short' })} {question.createdAt.toDate().getFullYear()}
                        </span>
                      )}
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-3 line-clamp-2 ${
                      darkMode ? "text-white" : "text-slate-800"
                    }`}>
                      {question.title}
                    </h2>
                    <p className={`line-clamp-2 mb-4 ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                      {question.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {question.author?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <span className={darkMode ? "text-slate-300" : "text-slate-600"}>
                          {question.author}
                        </span>
                      </div>
                      <span className={darkMode ? "text-slate-500" : "text-slate-400"}>
                        • {question.createdAt?.toDate().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/question/${question.id}`}
                    className="flex-shrink-0 self-start sm:self-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105"
                  >
                    View Discussion →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;