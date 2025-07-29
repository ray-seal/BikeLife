import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const UserProfilePage: React.FC = () => {
  const { user_id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <main>Loading...</main>;
  if (error) return <main className="text-red-500">{error}</main>;

  return (
    <main className="p-4 max-w-md mx-auto">
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
      <div className="mb-2"><span className="font-semibold">Dream Bike:</span> {profile.dream_bike}</div>
      <div className="mb-2"><span className="font-semibold">Current Bike:</span> {profile.current_bike}</div>
      <div className="mb-2"><span className="font-semibold">Licence Held:</span> {profile.licence_held}</div>
      <div className="mb-2"><span className="font-semibold">Location:</span> {profile.location}</div>
    </main>
  );
};
