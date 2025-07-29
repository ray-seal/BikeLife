import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const UserProfilePage: React.FC = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user for follow logic
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user_id)
        .single();
      if (error || !data) {
        setError("Profile not found.");
        setProfile(null);
      } else {
        setProfile(data);
        setError(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user_id]);

  // Placeholder follow handler (to be implemented)
  const handleFollow = async () => {
    // Add logic for following here (e.g. insert into followers table)
    alert("Follow user functionality coming soon!");
    // Example:
    // await supabase.from("followers").insert({ follower_id: currentUserId, following_id: user_id });
  };

  if (loading) return <main>Loading...</main>;
  if (error) return <main className="text-red-500">{error}</main>;

  return (
    <main className="p-4 max-w-md mx-auto">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => navigate("/news-feed")}
      >
        ← Back to News Feed
      </button>
      <h2 className="text-xl mb-4 text-center">{profile.name}'s Profile</h2>
      {profile.profile_pic_url ? (
        <img
          src={profile.profile_pic_url}
          alt="Profile"
          className="rounded-full border mb-4"
          style={{ width: 120, height: 120, objectFit: "cover" }}
        />
      ) : (
        <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-5xl">
          <span role="img" aria-label="avatar">👤</span>
        </div>
      )}
      {/* Show follow button unless viewing own profile */}
      {currentUserId && user_id !== currentUserId && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleFollow}
        >
          Follow
        </button>
      )}
      <div className="mb-2"><span className="font-semibold">Dream Bike:</span> {profile.dream_bike}</div>
      <div className="mb-2"><span className="font-semibold">Current Bike:</span> {profile.current_bike}</div>
      <div className="mb-2"><span className="font-semibold">Licence Held:</span> {profile.licence_held}</div>
      <div className="mb-2"><span className="font-semibold">Location:</span> {profile.location}</div>
    </main>
  );
};
