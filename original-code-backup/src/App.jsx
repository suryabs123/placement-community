import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AskQuestion from "./pages/AskQuestion";
import QuestionPage from "./pages/QuestionPage";
import PublicChat from "./pages/PublicChat";
import ChatPage from "./pages/ChatPage";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Questions */}
        <Route path="/ask" element={<AskQuestion />} />
        <Route path="/question/:id" element={<QuestionPage />} />

        {/* Chats */}
        <Route path="/publicchat" element={<PublicChat />} />
        <Route path="/chat" element={<ChatPage />} />

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/editprofile" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;