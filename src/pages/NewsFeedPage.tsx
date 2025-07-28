import React, { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";

// Supabase config
const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = "news-feed-photos";

type Profile = {
  user_id: string;
  name: string;
  profile_pic_url: string | null;
};

type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

type Post = {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profile?: Profile;
  like_count?: number;
  comment_count?: number;
  comments_list?: Comment[];
  liked_by_user?: boolean;
};

export const NewsFeedPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Editing
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  // Comments
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<{[postId: string]: boolean}>({});

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profile")
          .select("user_id,name,profile_pic_url")
          .eq("user_id", data.user.id)
          .single();
        if (profileData) setProfile(profileData);
      }
    });
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      // Fetch posts with profile, count of likes and comments, and if liked by current user
      let query = supabase
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
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        setError("Failed to fetch posts: " + error.message);
        setLoading(false);
        return;
      }

      // Fetch likes for current user to mark liked posts
      let likedPosts: string[] = [];
      if (user) {
        const { data: userLikes } = await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id);
        likedPosts = (userLikes || []).map((like) => like.post_id);
      }

      const mapped = (data as any[]).map((p) => ({
        ...p,
        like_count: p.likes?.[0]?.count || 0,
        comment_count: p.comments?.[0]?.count || 0,
        liked_by_user: user ? likedPosts.includes(p.id) : false,
      }));
      setPosts(mapped);
      setLoading(false);
    };
    fetchPosts();
  }, [refresh, user]);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file);

    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

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

  // Like/unlike logic: toggle like for current user
  const handleLike = async (post: Post) => {
    if (!user) return;
    try {
      if (post.liked_by_user) {
        // Remove like
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
      } else {
        // Add like
        await supabase
          .from("likes")
          .insert([{ post_id: post.id, user_id: user.id }]);
      }
      setRefresh((r) => r + 1);
    } catch (e) {
      setError("Failed to update like.");
    }
  };

  // Edit post handlers
  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content || "");
  };

  const handleEditCancel = () => {
    setEditingPostId(null);
    setEditContent("");
    setError(null);
  };

  const handleEditSave = async (postId: string) => {
    if (!user) return;
    const { data, error: updateError } = await supabase
      .from("posts")
      .update({ content: editContent })
      .eq("id", postId)
      .select();

    if (updateError) {
      setError("Edit failed: " + updateError.message);
    } else if (!data || data.length === 0) {
      setError("Edit failed: No matching post found or you do not have permission.");
    } else {
      setEditingPostId(null);
      setEditContent("");
      setError(null);
      setRefresh((r) => r + 1);
    }
  };

  // Comments handlers
  const toggleShowComments = (postId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentInput = (postId: string, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user || !commentInputs[postId]?.trim()) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    setError(null);

    try {
      const { error: insertError } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: user.id,
          content: commentInputs[postId].trim(),
        },
      ]);
      if (insertError) throw insertError;
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setRefresh((r) => r + 1);
    } catch (err: any) {
      setError(err.message || "Failed to add comment.");
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 relative">
      {profile && profile.profile_pic_url && (
        <img
          src={profile.profile_pic_url}
          className="w-10 h-10 rounded-full cursor-pointer absolute top-4 left-4 border-2 border-blue-500"
          alt="My profile"
          title="View my profile"
          onClick={() => navigate("/create-profile")}
        />
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">News Feed</h1>

      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            className="w-full border rounded p-2 mb-2 text-black"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            style={{ color: "#000" }}
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
                    className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                    alt={post.profile.name || "user"}
                    title="View user's profile"
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                )}
                <Link
                  to={`/profile/${post.user_id}`}
                  className="font-bold hover:underline text-black"
                >
                  {post.profile?.name || "User"}
                </Link>
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleString("en-GB")}
                </span>
              </div>
              {editingPostId === post.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="border rounded p-2 text-black"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={2}
                    style={{ color: "#000" }}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                      onClick={() => handleEditSave(post.id)}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded"
                      onClick={handleEditCancel}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-black">{post.content}</p>
                  {post.user_id === user?.id && (
                    <button
                      className="text-xs text-blue-600 underline mb-2"
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="post"
                  className="max-w-full max-h-72 mb-2 rounded"
                />
              )}
              <div className="flex gap-4 text-sm">
                <button
                  className={`flex items-center gap-1 ${post.liked_by_user ? "text-red-600" : "text-blue-600"}`}
                  onClick={() => handleLike(post)}
                  disabled={!user}
                  title={user ? (post.liked_by_user ? "Unlike" : "Like") : "Sign in to like"}
                  type="button"
                >
                  {post.liked_by_user ? "❤️" : "👍"} {post.like_count || 0}
                </button>
                <button
                  className="flex items-center gap-1 text-gray-600"
                  onClick={() => toggleShowComments(post.id)}
                  type="button"
                >
                  💬 {post.comment_count || 0}
                </button>
              </div>
              {showComments[post.id] && (
                <div className="mt-2">
                  {post.comments_list && post.comments_list.length > 0 ? (
                    post.comments_list
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((c) => (
                        <div key={c.id} className="text-sm text-black border-t py-1 flex items-center">
                          <span className="font-bold mr-2">{c.profile?.name || "User"}:</span>
                          <span>{c.content}</span>
                          <span className="ml-auto text-xs text-gray-400">{new Date(c.created_at).toLocaleString("en-GB")}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-gray-500 border-t py-1">No comments yet.</div>
                  )}
                  {user && (
                    <form
                      className="flex items-center gap-2 mt-2"
                      onSubmit={(e) => handleAddComment(e, post.id)}
                    >
                      <input
                        className="border p-1 rounded flex-1 text-black"
                        value={commentInputs[post.id] || ""}
                        onChange={e => handleCommentInput(post.id, e.target.value)}
                        placeholder="Add a comment..."
                      />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        type="submit"
                        disabled={submittingComment[post.id]}
                      >
                        {submittingComment[post.id] ? "..." : "Comment"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default NewsFeedPage;
