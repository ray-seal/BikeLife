import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { CallbackPage } from "./pages/CallbackPage";
import { CreateProfilePage } from "./pages/CreateProfilePage";
import { NewsFeedPage } from "./pages/NewsFeedPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Notifications } from "./components/Notifications";
import { FollowersFeedPage } from "./pages/FollowersFeedPage";
import DeleteAccount from "./pages/DeleteAccount";

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
        <Route path="/followers-feed" element={<FollowersFeedPage />} /> {/* <-- ADD THIS ROUTE */}
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
