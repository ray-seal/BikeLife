import React, { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { Post } from "../components/Post"; // Adjust path as needed
import { supabase } from "../supabaseClient";


export const FollowersFeedPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user on mount
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  useEffect(() => {
    const fetchFollowersPosts = async () => {
      setLoading(true);

      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

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
        .select(
          `
            *,
            profile:profile(user_id,name,profile_pic_url),
            likes(count),
            likes_list:likes(id,user_id,post_id,profile:profile(user_id,name,profile_pic_url)),
            comments(count),
            comments_list:comments(
              id, user_id, post_id, content, created_at,
              profile:profile(user_id,name,profile_pic_url)
            )
          `
        )
        .in("user_id", followedIds)
        .order("created_at", { ascending: false });

      setPosts(postsData ?? []);
      setLoading(false);
    };

    if (user) fetchFollowersPosts();
  }, [user]);

  // Dummy handlers to satisfy Post props
  const noop = () => {};
  const noopForm = (e: React.FormEvent) => { e.preventDefault(); };
  const noopStr = (_: string) => {};
  const noopStrStr = (_1: string, _2: string) => {};
  const noopFormStr = (e: React.FormEvent, _postId: string) => { e.preventDefault(); };

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
            <Post
              key={post.id}
              post={post}
              user={user}
              onLike={noop}
              onDelete={noop}
              onEdit={noopStrStr}
              onEditSubmit={noopForm}
              editingPostId={null}
              editContent=""
              setEditContent={noopStr}
              showComments={false}
              toggleShowComments={noopStr}
              commentsList={post.comments_list}
              commentInput=""
              handleCommentInput={noopStrStr}
              handleAddComment={noopFormStr}
              submittingComment={false}
            />
          ))}
        </ul>
      )}
    </main>
  );
};
