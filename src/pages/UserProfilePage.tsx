import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

export const UserProfilePage: React.FC = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (!user_id) return;
    // Get followers and following counts
    const fetchCounts = async () => {
      const { count: followers } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user_id);
      setFollowersCount(followers ?? 0);

      const { count: following } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user_id);
      setFollowingCount(following ?? 0);
    };
    fetchCounts();
  }, [user_id, isFollowing]);

  useEffect(() => {
    if (!currentUserId || !user_id || currentUserId === user_id) return;
    // Check if current user is following this profile
    const checkFollowing = async () => {
      const { data } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", user_id)
        .single();
      setIsFollowing(!!data);
    };
    checkFollowing();
  }, [currentUserId, user_id]);

  const handleFollow = async () => {
    if (!currentUserId || !user_id || currentUserId === user_id) return;
    setFollowLoading(true);
    // Add follower
    const { error } = await supabase
      .from("followers")
      .insert([{ follower_id: currentUserId, following_id: user_id }]);
    if (!error) {
      setIsFollowing(true);
      // Insert notification for followed user
      await supabase
        .from("notifications")
        .insert([{
          user_id: user_id,
          actor_id: currentUserId,
          type: "follow"
        }]);
    }
    setFollowLoading(false);
  };

  const handleUnfollow = async () => {
    if (!currentUserId || !user_id || currentUserId === user_id) return;
    setFollowLoading(true);
    await supabase
      .from("followers")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", user_id);
    setIsFollowing(false);
    setFollowLoading(false);
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
      <h2 className="text-xl mb-2 text-center">{profile.name}'s Profile</h2>
      <div className="flex justify-center gap-4 mb-4">
        <div>
          <span className="font-semibold">Followers:</span> {followersCount}
        </div>
        <div>
          <span className="font-semibold">Following:</span> {followingCount}
        </div>
      </div>
      {profile.profile_pic_url ? (
        <img
          src={profile.profile_pic_url}
          alt="Profile"
          className="rounded-full border mb-4 mx-auto block"
          style={{ width: 120, height: 120, objectFit: "cover" }}
        />
      ) : (
        <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-5xl mx-auto">
          <span role="img" aria-label="avatar">👤</span>
        </div>
      )}
      {/* Show follow/unfollow button unless viewing own profile */}
      {currentUserId && user_id !== currentUserId && (
        <div className="flex justify-center mb-4">
          {isFollowing ? (
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={handleUnfollow}
              disabled={followLoading}
            >
              {followLoading ? "..." : "Unfollow"}
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? "..." : "Follow"}
            </button>
          )}
        </div>
      )}
      <div className="mb-2"><span className="font-semibold">Dream Bike:</span> {profile.dream_bike}</div>
      <div className="mb-2"><span className="font-semibold">Current Bike:</span> {profile.current_bike}</div>
      <div className="mb-2"><span className="font-semibold">Licence Held:</span> {profile.licence_held}</div>
      <div className="mb-2"><span className="font-semibold">Location:</span> {profile.location}</div>
    </main>
  );
};
