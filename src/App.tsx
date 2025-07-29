import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import CallbackPage from "./pages/CallbackPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import NewsFeedPage from "./pages/NewsFeedPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
// Import Notifications bell component
import { Notifications } from "./components/Notifications";

function App() {
  return (
    <Router>
      {/* Top bar with Notifications bell */}
      <div className="flex justify-end items-center p-2">
        <Notifications />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/news-feed" element={<NewsFeedPage />} />
        <Route path="/profile/:user_id" element={<UserProfilePage />} />
        <Route
          path="/test"
          element={<div style={{ padding: 32, fontSize: 24 }}>Test Route Works</div>}
        />
        {/* Catch-all must go last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
