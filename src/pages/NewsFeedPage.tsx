import React, { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { Post } from "../components/Post"; // Adjust path as needed!
import { supabase } from "../supabaseClient";

type Profile = {
  user_id: string;
  name: string;
  profile_pic_url?: string;
  dream_bike?: string;
  current_bike?: string;
  licence_held?: string;
  location?: string;
};

type PostType = {
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
  likes_list?: Like[];
};

type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

type Like = {
  id: string;
  user_id: string;
  post_id: string;
  profile?: Profile;
};

const BUCKET = "post-images";

export const NewsFeedPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
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

  // Notifications
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch user on mount (only once!)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // Fetch unread notifications for red dot
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setHasUnreadNotifications(false);
        return;
      }
      const { data } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("read", false)
        .limit(1);
      setHasUnreadNotifications((data ?? []).length > 0);
    };
    fetchNotifications();
  }, [user, refresh]);

  // Redirect to /create-profile if user is logged in but has no profile
  useEffect(() => {
    if (!user) return;
    if (window.location.pathname === "/create-profile") return;
    const fetchProfile = async () => {
      const { data, error, status } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (
        (!data && error && error.message && error.message.toLowerCase().includes("no rows")) ||
        status === 406
      ) {
        navigate("/create-profile");
      } else if (!data || error) {
        setError("Could not fetch profile");
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

      let query = supabase
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
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        setError("Failed to fetch posts: " + error.message);
        setLoading(false);
        return;
      }

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

  // CRUCIAL: This uses user.id from Supabase Auth as user_id for RLS
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
      // Always use Supabase Auth UID for user_id
      const postData = {
        user_id: user.id,
        content,
        image_url,
        created_at: new Date().toISOString(),
      };
      console.log("Insert post data:", postData); // Debugging output
      const { error: insertError } = await supabase.from("posts").insert([postData]);
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
      const commentData = {
        post_id: postId,
        user_id: user.id,
        content: commentInputs[postId].trim(),
        created_at: new Date().toISOString(),
      };
      console.log("Insert comment data:", commentData); // Debugging output
      const { error: insertError } = await supabase.from("comments").insert([commentData]);
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
      {/* Top row: Log Out button & Followers Feed button */}
      <div className="flex justify-end gap-2 absolute top-4 right-4" style={{ zIndex: 10 }}>
        <button
          onClick={handleLogOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        >
          Log Out
        </button>
        <Link
          to="/followers-feed"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow flex items-center"
        >
          Followers Feed
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center text-black">News Feed</h1>

      {user && (
        <form className="mb-6 flex gap-3" onSubmit={handleSubmit}>
          {/* LEFT: Profile pic/avatar, clickable */}
          <div style={{ position: "relative" }}>
            {profile && profile.profile_pic_url ? (
              <img
                src={profile.profile_pic_url}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-500"
                alt="My profile"
                title="View my profile"
                onClick={() => navigate("/create-profile")}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer border-2 border-blue-500"
                title="View my profile"
                onClick={() => navigate("/create-profile")}
              >
                <span role="img" aria-label="avatar" className="text-2xl">👤</span>
              </div>
            )}
            {hasUnreadNotifications && (
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  zIndex: 20,
                  width: 12,
                  height: 12,
                  backgroundColor: "red",
                  borderRadius: "50%",
                  border: "2px solid white",
                  boxShadow: "0 0 2px #333",
                  display: "block",
                }}
              />
            )}
          </div>
          {/* RIGHT: textarea, file input, and submit button stacked vertically */}
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="w-full border rounded p-2 text-black"
              rows={2}
              placeholder="What you revvin' about today?"
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
            <Post
              key={post.id}
              post={post}
              user={user}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onEditSubmit={handleEditSubmit}
              editingPostId={editingPostId}
              editContent={editContent}
              setEditContent={setEditContent}
              showComments={showComments[post.id]}
              toggleShowComments={toggleShowComments}
              commentsList={post.comments_list}
              commentInput={commentInputs[post.id] || ""}
              handleCommentInput={handleCommentInput}
              handleAddComment={handleAddComment}
              submittingComment={submittingComment[post.id]}
            />
          ))}
        </ul>
      )}
    </main>
  );
};
