import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const Post: React.FC<{ post: any; userId: string }> = ({ post, userId }) => {
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Fetch likes and join with profile for names
    const fetchLikes = async () => {
      const { data: likesData } = await supabase
        .from("likes")
        .select(`
          *,
          user:profile(user_id, name)
        `)
        .eq("post_id", post.id);
      setLikes(likesData || []);
      setLiked((likesData || []).some((l: any) => l.user_id === userId));
    };

    // Fetch comments if needed
    const fetchComments = async () => {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id);
      setComments(commentsData || []);
    };

    fetchLikes();
    fetchComments();
  }, [post.id, userId]);

  const handleLike = async () => {
    if (liked) {
      // Remove like
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);
    } else {
      // Add like
      await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: userId });
    }
    // Refresh likes
    const { data: likesData } = await supabase
      .from("likes")
      .select(`
        *,
        user:profile(user_id, name)
      `)
      .eq("post_id", post.id);
    setLikes(likesData || []);
    setLiked((likesData || []).some((l: any) => l.user_id === userId));
  };

  return (
    <div className="rounded-lg shadow bg-white mb-4">
      <div>
        {/* Post picture */}
        <img src={post.image_url} alt="" className="w-full" />
      </div>
      <div className="flex justify-between items-center px-4 py-2">
        {/* Comments button on left */}
        <button className="flex items-center text-gray-800 hover:text-blue-600 font-semibold">
          <span role="img" aria-label="comment" className="mr-1">💬</span>
          {comments.length}
        </button>
        {/* Likes button on right */}
        <button
          className={`flex items-center font-semibold ${liked ? "text-red-600" : "text-gray-800 hover:text-pink-600"}`}
          onClick={handleLike}
        >
          <span role="img" aria-label="like" className="mr-1">
            {liked ? "❤️" : "👍"}
          </span>
          {likes.length}
        </button>
      </div>
      {/* Likes list, darker text */}
      {likes.length > 0 && (
        <div className="px-4 pb-2 text-gray-900 font-medium text-sm">
          Liked by {likes.map((l, i) => (
            <React.Fragment key={l.user?.user_id || l.user_id}>
              <Link to={`/profile/${l.user?.user_id || l.user_id}`} className="font-bold hover:underline">
                {l.user?.name || l.user_id}
              </Link>
              {i < likes.length - 1 ? ", " : ""}
            </React.Fragment>
          ))}
        </div>
      )}
      {/* Post content */}
      <div className="px-4 pb-4">
        <div className="text-gray-800">{post.content}</div>
      </div>
    </div>
  );
};
