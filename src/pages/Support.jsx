import { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import emailjs from '@emailjs/browser';

function Support() {
  const { darkMode } = useContext(ThemeContext);
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("bot");
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "👋 Hello! I'm your placement assistant. How can I help you today?", 
      sender: "bot",
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const messagesEndRef = useRef(null);
  const formRef = useRef();

  // ========== YOUR EMAILJS KEYS ==========
  const EMAILJS_SERVICE_ID = "service_ul24lzq";
  const EMAILJS_TEMPLATE_ID = "template_xeq7g1s"; // ⚠️ REPLACE with your Template ID
  const EMAILJS_PUBLIC_KEY = "3oq-tpuko9dW9nIsA";
  // =========================================

  // Bot responses
  const botResponses = {
    "placement": "📋 **Placement Process:**\n\n1. Companies visit campus for recruitment\n2. Students register for drives\n3. Online tests are conducted\n4. Technical interviews\n5. HR interviews\n6. Offer letters are issued\n\nNeed help with any specific step?",
    
    "resume": "📄 **Resume Tips:**\n\n✅ Keep it 1 page (2 max)\n✅ Use a professional format\n✅ Highlight your projects\n✅ Include internships experience\n✅ Add relevant skills\n✅ Quantify achievements\n\nWould you like to know more?",
    
    "interview": "🎯 **Interview Preparation:**\n\n1. Research the company\n2. Practice common questions\n3. Prepare your introduction\n4. Review your projects\n5. Practice coding problems\n6. Prepare questions to ask\n\nWant specific tips for technical or HR interviews?",
    
    "coding": "💻 **Coding Preparation:**\n\n🔹 Practice on platforms like:\n- LeetCode\n- HackerRank\n- CodeChef\n- GeeksforGeeks\n\n🔹 Focus on:\n- Data Structures\n- Algorithms\n- Problem Solving\n- Time Complexity",
    
    "dsa": "📊 **DSA Topics to Master:**\n\n1. Arrays & Strings\n2. Linked Lists\n3. Stacks & Queues\n4. Trees & Graphs\n5. Dynamic Programming\n6. Sorting & Searching\n7. Recursion\n\nWhich topic would you like to learn more about?",
    
    "company": "🏢 **Top Recruiting Companies:**\n\n✅ Google\n✅ Microsoft\n✅ Amazon\n✅ Flipkart\n✅ Infosys\n✅ TCS\n✅ Wipro\n✅ Accenture\n\nWould you like to know about a specific company?",
    
    "package": "💰 **Salary Packages:**\n\n💵 Average packages vary by company:\n- MNCs: 7-15 LPA\n- Product Companies: 12-30 LPA\n- Startups: 5-12 LPA\n- Core Companies: 4-8 LPA\n\nHighest package in recent years: 53.5 LPA",
    
    "aptitude": "🧮 **Aptitude Preparation:**\n\n📚 Topics to cover:\n- Quantitative Aptitude\n- Logical Reasoning\n- Verbal Ability\n- Data Interpretation\n\nPractice daily and take mock tests. Any specific topic you need help with?",
    
    "help": "🤖 **I can help you with:**\n\n📋 Placement Process\n📄 Resume Tips\n🎯 Interview Prep\n💻 Coding Practice\n📊 DSA Topics\n🏢 Companies\n💰 Packages\n🧮 Aptitude\n\nJust type your question!",
    
    "default": "I understand you're asking about that. Could you please be more specific? I can help with:\n\n📋 Placement Process\n📄 Resume Tips\n🎯 Interview Preparation\n💻 Coding Practice\n📊 DSA Topics\n🏢 Company Info\n💰 Salary Packages\n\nWhat would you like to know?"
  };

  const getBotResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("placement") || lowerMsg.includes("process")) {
      return botResponses.placement;
    } else if (lowerMsg.includes("resume") || lowerMsg.includes("cv")) {
      return botResponses.resume;
    } else if (lowerMsg.includes("interview") || lowerMsg.includes("hr")) {
      return botResponses.interview;
    } else if (lowerMsg.includes("coding") || lowerMsg.includes("program")) {
      return botResponses.coding;
    } else if (lowerMsg.includes("dsa") || lowerMsg.includes("data structure") || lowerMsg.includes("algorithm")) {
      return botResponses.dsa;
    } else if (lowerMsg.includes("company") || lowerMsg.includes("recruit")) {
      return botResponses.company;
    } else if (lowerMsg.includes("package") || lowerMsg.includes("salary") || lowerMsg.includes("lpa")) {
      return botResponses.package;
    } else if (lowerMsg.includes("aptitude") || lowerMsg.includes("quant")) {
      return botResponses.aptitude;
    } else if (lowerMsg.includes("help") || lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      return botResponses.help;
    } else {
      return botResponses.default;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMsg = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    setEmailSent(true);

    if (!emailSubject.trim() || !emailMessage.trim()) {
      setEmailError("Please fill all fields");
      setEmailSent(false);
      return;
    }

    try {
      const templateParams = {
        from_name: currentUser?.displayName || "User",
        from_email: currentUser?.email || "No email",
        subject: emailSubject,
        message: emailMessage,
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        setEmailSuccess("✅ Your message has been sent! We'll get back to you within 24 hours.");
        setEmailSubject("");
        setEmailMessage("");
        setTimeout(() => {
          setEmailSuccess("");
        }, 5000);
      }
    } catch (error) {
      console.log("Email error:", error);
      setEmailError("❌ Failed to send email. Please try again.");
    } finally {
      setEmailSent(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`min-h-screen pt-20 ${
      darkMode ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50/30"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            🆘 Support Center
          </h1>
          <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Get help with your placement journey
          </p>
        </div>

        <div className={`flex rounded-2xl p-1 mb-8 ${
          darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/80 backdrop-blur-sm shadow-lg border border-white/50"
        }`}>
          <button
            onClick={() => setActiveTab("bot")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === "bot"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : darkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            🤖 Chat Bot
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === "email"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                : darkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            ✉️ Email Support
          </button>
        </div>

        {activeTab === "bot" && (
          <div className={`rounded-3xl overflow-hidden ${
            darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-xl border border-white/50"
          }`}>
            <div className={`p-4 border-b ${darkMode ? "border-slate-700" : "border-slate-200"} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl">
                🤖
              </div>
              <div>
                <h3 className={`font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Placement Assistant
                </h3>
                <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Online • Ready to help
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Active</span>
              </div>
            </div>

            <div className="h-[400px] overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                        : darkMode
                        ? "bg-slate-700 text-white rounded-bl-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${
                      msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl rounded-bl-none ${
                    darkMode ? "bg-slate-700" : "bg-slate-100"
                  }`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-100"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask me  about placements..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 p-3 rounded-xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "border-slate-200 focus:border-indigo-500"
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className={`text-xs mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                💡 Try asking: "How to prepare for placements?" or "Resume tips"
              </p>
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className={`rounded-3xl p-8 ${
            darkMode ? "bg-slate-800/80 border border-slate-700/50" : "bg-white/90 backdrop-blur-sm shadow-xl border border-white/50"
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl">
                ✉️
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Email Support
                </h2>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Send us a message and we'll get back to you
                </p>
              </div>
            </div>

            {emailError && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                {emailSuccess}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSendEmail} className="space-y-5">
              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Your Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className={`w-full p-4 rounded-xl border-2 outline-none cursor-not-allowed ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 text-slate-400"
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="What's your query about?"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "border-slate-200 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`text-sm font-medium block mb-2 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  Message
                </label>
                <textarea
                  rows="6"
                  placeholder="Describe your issue in detail..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className={`w-full p-4 rounded-xl border-2 outline-none transition-all duration-300 resize-none ${
                    darkMode
                      ? "bg-slate-700/50 border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-500"
                      : "border-slate-200 focus:border-indigo-500"
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={emailSent}
                className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 ${
                  emailSent ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                }`}
              >
                {emailSent ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📤</span> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Support;