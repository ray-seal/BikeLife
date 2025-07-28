import React, { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";

// Initialize Supabase client
const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

type Profile = {
  user_id: string;
  name: string;
  profile_pic_url?: string;
  dream_bike?: string;
  current_bike?: string;
  licence_held?: string;
  location?: string;
};

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profile?: Profile;
  like_count?: number;
  comment_count?: number;
  comments_list?: Comment[];
  liked_by_user?: boolean;
};

type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

const BUCKET = "post-images";

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
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Fetch user on mount (only once!)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // Redirect to /create-profile if user is logged in but has no profile
  useEffect(() => {
    if (!user) return;
    if (window.location.pathname === "/create-profile") return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!data || error) {
        navigate("/create-profile");
      } else {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  // Fetch posts (use user, but don't update user here!)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      // Use user from state, do not call setUser here
      // Fetch posts with profiles, likes, and comments
      let query = supabase
        .from("posts")
        .select(
          `
            *,
            profile:profile(user_id,name,profile_pic_url),
            likes(count),
            comments(count),
            comments_list:comments(
              id, user_id, post_id, content, created_at,
              profile:profile(user_id,name,profile_pic_url)
            )
          `
        )
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
    if (!profile) {
      setError("You must create a profile before posting.");
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
          content,
          image_url,
        },
      ]);
      if (insertError) throw insertError;
      setContent("");
      setImageFile(null);
      setRefresh((r) => r + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
    } else {
      await supabase.from("likes").insert([{ user_id: user.id, post_id: postId }]);
    }
    setRefresh((r) => r + 1);
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    if (!window.confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id);
    setRefresh((r) => r + 1);
  };

  const handleEdit = (postId: string, existingContent: string) => {
    setEditingPostId(postId);
    setEditContent(existingContent);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPostId) return;
    const { error } = await supabase
      .from("posts")
      .update({ content: editContent })
      .eq("id", editingPostId)
      .eq("user_id", user.id);
    if (error) {
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

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate("/");
  };

  return (
    <main className="max-w-md mx-auto p-4 relative">
      {/* Log Out button in top right corner */}
      <button
        onClick={handleLogOut}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        style={{ zIndex: 10 }}
      >
        Log Out
      </button>

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
        <form className="mb-6" onSubmit={handleSubmit}>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={2}
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={uploading}
            required
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
            className="mb-2"
            disabled={uploading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              {uploading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {loading ? (
        <div>Loading...</div>
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
              <div className="mb-2 whitespace-pre-line break-words">
                {editingPostId === post.id ? (
                  <form onSubmit={handleEditSubmit}>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="border rounded w-full p-1 mb-2"
                      rows={2}
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded"
                        onClick={() => setEditingPostId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {post.content}
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="user upload"
                        className="mt-2 rounded max-h-64 object-contain w-full"
                      />
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-4 items-center text-sm">
                <button
                  onClick={() => handleLike(post.id, !!post.liked_by_user)}
                  className={`px-2 py-1 rounded ${
                    post.liked_by_user
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  👍 {post.like_count || 0}
                </button>
                <button
                  onClick={() => toggleShowComments(post.id)}
                  className="px-2 py-1 rounded bg-gray-200 text-gray-700"
                >
                  💬 {post.comment_count || 0}
                </button>
                {user && post.user_id === user.id && editingPostId !== post.id && (
                  <>
                    <button
                      onClick={() => handleEdit(post.id, post.content)}
                      className="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-2 py-1 rounded bg-red-400 hover:bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
              {showComments[post.id] && (
                <div className="mt-2 border-t pt-2">
                  <ul>
                    {post.comments_list?.map((comment) => (
                      <li key={comment.id} className="mb-2">
                        <div className="flex items-center">
                          {comment.profile?.profile_pic_url ? (
                            <img
                              src={comment.profile.profile_pic_url}
                              className="w-6 h-6 rounded-full mr-2"
                              alt={comment.profile.name || "comment user"}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2" />
                          )}
                          <span className="font-semibold text-sm">
                            {comment.profile?.name || "User"}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString("en-GB")}
                          </span>
                        </div>
                        <div className="ml-8 text-sm">{comment.content}</div>
                      </li>
                    ))}
                  </ul>
                  <form
                    className="flex gap-2 mt-2"
                    onSubmit={e => handleAddComment(e, post.id)}
                  >
                    <input
                      type="text"
                      className="border rounded flex-1 p-1"
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={e => handleCommentInput(post.id, e.target.value)}
                      disabled={submittingComment[post.id]}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      disabled={submittingComment[post.id]}
                    >
                      {submittingComment[post.id] ? "..." : "Post"}
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};
