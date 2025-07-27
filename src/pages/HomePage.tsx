import React, { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";

// Initialize Supabase client
const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const HomePage: React.FC = () => {
  const [view, setView] = useState<"login" | "signup" | "user">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setView("user");
      }
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setView("user");
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setView("user");
      // navigate to create-profile after sign up
      navigate("/create-profile");
    }
  };

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else setView("user");
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("login");
    setEmail("");
    setPassword("");
  };

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
              className="border p-2 rounded"
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
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