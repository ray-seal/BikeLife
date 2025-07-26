import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
// import AuthPage from './pages/AuthPage'; //uncomment this when built
// import CallbackPage from './pages/CallbackPage'; //uncomment this when built
import { NotFoundPage } from './pages/NotFoundPage';
// Import ThemeSwitcher if used
// import ThemeSwitcher from './path-to-ThemeSwitcher';

function App() {
  return (
    <Router>
      {/* Uncomment the following line if ThemeSwitcher is imported */}
      {/* <ThemeSwitcher /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Also uncomment Auth and Callback when they get made */}
        {/*
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        */}
        
        {/* Catch-all must go last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
