import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CallbackPage } from './pages/CallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CreateProfilePage } from './pages/CreateProfilePage'; // import your new page

function App() {
  return (
    <Router>
      {/* Uncomment the following line if ThemeSwitcher is imported */}
      {/* <ThemeSwitcher /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />}  {/* your new route */}
        <Route path="/test" element={div style={{ padding:32, fontSize: 24 }}>Test Route Works</div>} />
        {/* Catch-all must go last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
