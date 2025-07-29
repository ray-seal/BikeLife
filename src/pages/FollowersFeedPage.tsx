import React, { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { Post } from "../components/Post"; // adjust path as needed

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_KEY!);

export const FollowersFeedPage: React.FC<{ user: User }> = ({ user }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowersPosts = async () => {
      setLoading(true);
      // 1. Get list of user_ids that current user follows
      const { data: follows } = await supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", user.id);

      const followedIds = (follows ?? []).map((f: any) => f.followed_id);
      if (followedIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 2. Get posts from those users
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profile:profile(user_id,name,profile_pic_url),
          likes(count),
          comments(count),
          comments_list:comments(
            id, user_id, post_id, content, created_at,
            profile:profile(user_id,name,profile_pic_url)
          )
        `)
        .in("user_id", followedIds)
        .order("created_at", { ascending: false });

      setPosts(postsData ?? []);
      setLoading(false);
    };

    fetchFollowersPosts();
  }, [user]);

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">Followers Feed</h1>
      {loading ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div>No posts from people you follow.</div>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <Post key={post.id} post={post} user={user} />
          ))}
        </ul>
      )}
    </main>
  );
};
