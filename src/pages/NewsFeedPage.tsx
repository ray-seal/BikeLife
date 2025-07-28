import React, { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";

// TODO: Move these to a central config
const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "news-feed-photos";

type Post = {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profile?: { name: string; profile_pic_url: string | null };
  like_count?: number;
  comment_count?: number;
};

export const NewsFeedPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  // Fetch posts (with user profiles, like and comment counts)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profile:profile(user_id,name,profile_pic_url),
          likes(count),
          comments(count)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Failed to fetch posts");
        setLoading(false);
        return;
      }

      // Map like/comment counts
      const mapped = (data as any[]).map((p) => ({
        ...p,
        like_count: p.likes[0]?.count || 0,
        comment_count: p.comments[0]?.count || 0,
      }));
      setPosts(mapped);
      setLoading(false);
    };
    fetchPosts();
  }, [refresh]);

  // Upload image to bucket and return public URL
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file);

    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  // Handle new post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to post.");
      return;
    }
    setUploading(true);
    setError(null);

    let image_url = null;
    try {
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          content: content || null,
          image_url,
        },
      ]);
      if (insertError) throw insertError;
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setRefresh((r) => r + 1);
    } catch (err: any) {
      setError(err.message || "Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  // Like a post
  const handleLike = async (postId: string) => {
    if (!user) return;
    await supabase.from("likes").insert([{ post_id: postId, user_id: user.id }], { upsert: true, onConflict: "post_id,user_id" });
    setRefresh((r) => r + 1);
  };

  // Render
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">News Feed</h1>

      {/* Create post */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            ref={fileInputRef}
            className="mb-2 block"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? "Posting..." : "Post"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}

      {/* Posts */}
      {loading ? (
        <div>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border rounded p-3 bg-white shadow"
            >
              <div className="flex items-center mb-2">
                {post.profile?.profile_pic_url ? (
                  <img
                    src={post.profile.profile_pic_url}
                    className="w-8 h-8 rounded-full mr-2"
                    alt={post.profile.name || "user"}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                )}
                <span className="font-bold">{post.profile?.name || "User"}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              {post.content && <p className="mb-2">{post.content}</p>}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="post"
                  className="max-w-full max-h-72 mb-2 rounded"
                />
              )}
              <div className="flex gap-4 text-sm">
                <button
                  className="flex items-center gap-1 text-blue-600"
                  onClick={() => handleLike(post.id)}
                  disabled={!user}
                  title={user ? "Like" : "Sign in to like"}
                  type="button"
                >
                  👍 {post.like_count || 0}
                </button>
                <span className="flex items-center gap-1 text-gray-600">
                  💬 {post.comment_count || 0}
                </span>
              </div>
              {/* TODO: Show comments, allow adding comments */}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default NewsFeedPage;
