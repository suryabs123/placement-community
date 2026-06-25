import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
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
  const [selectedTopic, setSelectedTopic] = useState("");
  const [stats, setStats] = useState({ total: 0, today: 0, users: 0, answers: 0 });
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  const popularTopics = [
    { name: "DSA", icon: "📊", color: "from-indigo-500 to-indigo-600" },
    { name: "Web Development", icon: "🌐", color: "from-purple-500 to-purple-600" },
    { name: "Aptitude", icon: "🧮", color: "from-emerald-500 to-emerald-600" },
    { name: "Interview Prep", icon: "🎯", color: "from-rose-500 to-rose-600" },
    { name: "Coding", icon: "💻", color: "from-amber-500 to-orange-600" },
    { name: "Placements", icon: "🏢", color: "from-pink-500 to-rose-600" },
    { name: "Resume", icon: "📄", color: "from-cyan-500 to-blue-600" },
    { name: "Projects", icon: "🚀", color: "from-violet-500 to-purple-600" },
  ];

  // Real-time questions listener
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
      
      const trending = [...data]
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 5);
      setTrendingQuestions(trending);
      
      setStats(prev => ({
        ...prev,
        total: data.length,
        today: todayQuestions.length,
        answers: data.reduce((acc, q) => acc + (q.answersCount || 0), 0),
      }));
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time users count
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        setStats(prev => ({
          ...prev,
          users: usersSnapshot.size,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats(prev => ({
        ...prev,
        users: snapshot.size,
      }));
    });
    return () => unsubscribe();
  }, []);

  // Real-time top contributors
  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const questionsSnapshot = await getDocs(collection(db, "questions"));
        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const contributorMap = {};
        questionsData.forEach(q => {
          const authorId = q.authorId;
          const authorName = q.author || "Unknown";
          if (authorId) {
            if (!contributorMap[authorId]) {
              contributorMap[authorId] = {
                name: authorName,
                id: authorId,
                questions: 0,
                answers: 0,
              };
            }
            contributorMap[authorId].questions += 1;
          }
        });

        const answersSnapshot = await getDocs(collection(db, "answers"));
        answersSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const authorId = data.authorId;
          const authorName = data.author || "Unknown";
          if (authorId) {
            if (!contributorMap[authorId]) {
              contributorMap[authorId] = {
                name: authorName,
                id: authorId,
                questions: 0,
                answers: 0,
              };
            }
            contributorMap[authorId].answers += 1;
          }
        });

        const contributors = Object.values(contributorMap).map(user => ({
          ...user,
          total: (user.questions || 0) + (user.answers || 0),
        }));

        const sorted = contributors
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        const withRoles = sorted.map((user, index) => {
          let role = "Member";
          if (user.total > 5) role = "Active Member";
          if (user.total > 10) role = "Expert";
          if (user.total > 20) role = "Top Contributor";
          if (index === 0 && user.total > 15) role = "🏆 Star Contributor";
          return { ...user, role };
        });

        setTopContributors(withRoles);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTopContributors();
    const unsubscribeQuestions = onSnapshot(collection(db, "questions"), () => {
      fetchTopContributors();
    });
    return () => {
      unsubscribeQuestions();
    };
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
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedTopic) {
      filtered = filtered.filter(q =>
        q.topics?.includes(selectedTopic) ||
        q.title?.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        q.description?.toLowerCase().includes(selectedTopic.toLowerCase())
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
      case "popular":
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
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

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/50"}`}>
        <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"}`}>
      {/* Hero Section - Dark Rich Gradient */}
      <div className={`relative overflow-hidden ${darkMode ? "bg-slate-800" : "bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700"}`}>
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 backdrop-blur-3xl rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-white/10 backdrop-blur-3xl rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                {stats.total}+ Questions • {stats.users}+ Members
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                  CIT Placement Community
                </span>
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto lg:mx-0 mb-8">
                Join thousands of students preparing for placements. Ask questions, 
                share knowledge, and get answers from experts and peers.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {!currentUser ? (
                  <>
                    <Link to="/register" className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                      🚀 Get Started
                    </Link>
                    <Link to="/login" className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-300">
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link to="/ask" className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    ❓ Ask a Question
                  </Link>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8">
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-2xl">👥</span>
                  <span className="text-sm">Active Community</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm">Placement Focused</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-white/80 mt-1">Questions</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">{stats.today}</div>
                <div className="text-sm text-white/80 mt-1">Asked Today</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">{stats.users}</div>
                <div className="text-sm text-white/80 mt-1">Members</div>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10 hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white">{stats.answers}</div>
                <div className="text-sm text-white/80 mt-1">Answers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6 sticky top-24">
              {/* Popular Topics */}
              <div className={`p-6 rounded-2xl ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  📚 Popular Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic) => (
                    <button
                      key={topic.name}
                      onClick={() => {
                        setSelectedTopic(selectedTopic === topic.name ? "" : topic.name);
                        setSearch("");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        selectedTopic === topic.name
                          ? `bg-gradient-to-r ${topic.color} text-white shadow-lg scale-105`
                          : darkMode
                          ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                          : "bg-indigo-50 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600"
                      }`}
                    >
                      <span>{topic.icon}</span>
                      <span className="whitespace-nowrap">{topic.name}</span>
                    </button>
                  ))}
                </div>
                {selectedTopic && (
                  <button
                    onClick={() => setSelectedTopic("")}
                    className="mt-3 text-xs text-rose-500 hover:text-rose-600 transition-colors w-full text-center"
                  >
                    ✕ Clear Topic Filter
                  </button>
                )}
              </div>

              {/* Trending Questions */}
              <div className={`p-6 rounded-2xl ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  🔥 Trending
                </h3>
                <div className="space-y-3">
                  {trendingQuestions.length > 0 ? (
                    trendingQuestions.map((q, index) => (
                      <Link 
                        key={q.id} 
                        to={`/question/${q.id}`}
                        className={`block p-3 rounded-xl transition-all duration-300 ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-indigo-50"}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-sm font-bold ${index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-orange-400" : "text-slate-400"}`}>
                            #{index + 1}
                          </span>
                          <div>
                            <p className={`text-sm font-medium line-clamp-2 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                              {q.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-indigo-500">👍 {q.upvotes || 0}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-400">{q.author}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      No trending questions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Top Contributors */}
              <div className={`p-6 rounded-2xl ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  🏆 Top Contributors
                </h3>
                <div className="space-y-3">
                  {topContributors.length > 0 ? (
                    topContributors.map((user, index) => (
                      <div key={user.id || index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-orange-400" : "bg-indigo-500"}`}>
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 text-[10px]">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-indigo-500 dark:text-indigo-400">{user.role || "Member"}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-500">{user.total || 0}</span>
                          <p className="text-[10px] text-slate-400">contrib</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      No contributors yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Search & Filters Bar */}
            <div className={`p-6 rounded-2xl mb-6 ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search questions, topics, or keywords..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (e.target.value) setSelectedTopic("");
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500"
                      : "bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500"
                  }`}
                >
                  <option value="newest">📅 Newest</option>
                  <option value="popular">🔥 Popular</option>
                  <option value="oldest">📅 Oldest</option>
                  <option value="year">📆 By Year</option>
                  <option value="month">📆 By Month</option>
                </select>

                {uniqueYears.length > 0 && (
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth("");
                    }}
                    className={`px-4 py-2 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500"
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
                    className={`px-4 py-2 rounded-xl border-2 outline-none transition-all duration-300 text-sm font-medium ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500"
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

                {(selectedTopic || selectedYear || selectedMonth || sortBy !== "newest") && (
                  <button
                    onClick={() => {
                      setSelectedTopic("");
                      setSelectedYear("");
                      setSelectedMonth("");
                      setSortBy("newest");
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-300"
                  >
                    ✕ Clear All
                  </button>
                )}

                <span className={`text-sm ml-auto ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {filteredQuestions.length} results
                </span>
              </div>

              {selectedTopic && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Filtering by:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    📚 {selectedTopic}
                  </span>
                </div>
              )}
            </div>

            {/* Questions Feed - No Vote Count */}
            {filteredQuestions.length === 0 ? (
              <div className={`p-16 rounded-3xl text-center ${darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <div className="text-6xl mb-4 animate-bounce">🔍</div>
                <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                  No questions found
                </h3>
                <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {selectedTopic ? `No questions about "${selectedTopic}" yet. Be the first to ask!` : "Try adjusting your filters or be the first to ask!"}
                </p>
                <Link to="/ask" className="inline-block mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
                  ❓ Ask a Question
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                      darkMode
                        ? "bg-slate-800/80 border border-slate-700/50 hover:bg-slate-800"
                        : "bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl border border-white/50 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-slate-700 text-slate-300" : "bg-indigo-50 text-slate-600"}`}>
                            {question.createdAt?.toDate().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                          {question.createdAt?.toDate() > new Date(Date.now() - 24*60*60*1000) && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 animate-pulse">
                              New
                            </span>
                          )}
                          {question.topics && question.topics.length > 0 && (
                            question.topics.slice(0, 2).map((topic) => {
                              const topicInfo = popularTopics.find(t => t.name === topic);
                              return topicInfo ? (
                                <span key={topic} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                  {topicInfo.icon} {topic}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>

                        <Link to={`/question/${question.id}`}>
                          <h2 className={`text-xl font-bold mb-2 hover:text-indigo-500 transition-colors ${darkMode ? "text-white" : "text-slate-800"}`}>
                            {question.title}
                          </h2>
                        </Link>

                        <p className={`line-clamp-2 mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {question.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                              {question.author?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <span className={darkMode ? "text-slate-300" : "text-slate-600"}>
                              {question.author}
                            </span>
                          </div>
                          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>•</span>
                          <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
                            💬 {question.answersCount || 0} answers
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 order-3">
            <div className="space-y-6 sticky top-24">
              {/* Quick Actions */}
              <div className={`p-6 rounded-2xl ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/ask" className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-indigo-50"}`}>
                    <span className="text-xl">❓</span>
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Ask Question</span>
                  </Link>
                  <Link to="/publicchat" className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-indigo-50"}`}>
                    <span className="text-xl">💬</span>
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Public Chat</span>
                  </Link>
                  <Link to="/chat" className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 ${darkMode ? "hover:bg-slate-700/50" : "hover:bg-indigo-50"}`}>
                    <span className="text-xl">🔒</span>
                    <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Private Chat</span>
                  </Link>
                  {!currentUser && (
                    <div className={`border-t ${darkMode ? "border-slate-700" : "border-slate-200"} pt-3`}>
                      <Link to="/register" className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
                        Join Community
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Community Stats */}
              <div className={`p-6 rounded-2xl ${darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"}`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  📊 Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                    <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Questions</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                    <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Today's Questions</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{stats.today}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                    <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Community Members</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{stats.users}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-all duration-300">
                    <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Answers Given</span>
                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>{stats.answers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;