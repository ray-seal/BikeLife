import React, { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";


export const HomePage: React.FC = () => {
  const [view, setView] = useState<"login" | "signup" | "user">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setView("user");
        navigate("/news-feed");
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView("user");
        navigate("/news-feed");
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      setUser(data.user ?? null);
      setView("user");
      navigate("/create-profile");
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      setUser(data.user ?? null);
      setView("user");
      navigate("/news-feed");
    }
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("login");
    setEmail("");
    setPassword("");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">BikeLife</h1>
      {view === "user" && user ? (
        <div>
          <p className="mb-2">Logged in as: <b>{user.email}</b></p>
          <div className="flex gap-2 mb-2">
            <button
              className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
              onClick={handleLogOut}
            >
              Log Out
            </button>
            <Link
              to="/create-profile"
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
            >
              Create or Edit Profile
            </Link>
            <Link
              to="/news-feed"
              className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded"
            >
              Go to News Feed
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-4 mb-4">
            <button
              className={`py-1 px-4 rounded ${view === "login" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setView("login")}
            >
              Log In
            </button>
            <button
              className={`py-1 px-4 rounded ${view === "signup" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => setView("signup")}
            >
              Sign Up
            </button>
          </div>
          <form
            onSubmit={view === "login" ? handleLogIn : handleSignUp}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              autoComplete="email"
              className="border p-2 rounded"
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              autoComplete="current-password"
              className="border p-2 rounded"
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              {view === "login" ? "Log In" : "Sign Up"}
            </button>
            {error && <div className="text-red-500">{error}</div>}
          </form>
        </div>
      )}
    </main>
  );
};
